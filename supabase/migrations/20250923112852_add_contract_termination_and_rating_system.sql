-- Add contract termination and rating system
-- This migration enhances the existing car_assignments and driver_ratings tables
-- to support contract termination workflows and rating requirements

-- 1. Enhanced car_assignments table to support contract termination
ALTER TABLE car_assignments 
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS termination_reason TEXT CHECK (termination_reason IN (
  'contract_completed', 
  'mutual_agreement', 
  'owner_terminated', 
  'driver_terminated', 
  'violation_of_terms',
  'other'
)),
ADD COLUMN IF NOT EXISTS termination_notes TEXT,
ADD COLUMN IF NOT EXISTS terminated_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS rating_required BOOLEAN DEFAULT false; -- Flag to indicate if rating is pending

-- Add comments for documentation
COMMENT ON COLUMN car_assignments.contract_start_date IS 'Official start date of the contract';
COMMENT ON COLUMN car_assignments.contract_end_date IS 'Official end date of the contract';
COMMENT ON COLUMN car_assignments.termination_reason IS 'Reason for contract termination';
COMMENT ON COLUMN car_assignments.termination_notes IS 'Additional notes about the termination';
COMMENT ON COLUMN car_assignments.terminated_by IS 'User who initiated the termination';
COMMENT ON COLUMN car_assignments.terminated_at IS 'Timestamp when termination was processed';
COMMENT ON COLUMN car_assignments.is_active IS 'Whether this assignment is currently active';
COMMENT ON COLUMN car_assignments.rating_required IS 'Whether owner needs to provide rating for this driver';

-- 2. Enhanced driver_ratings table (building on existing structure)
ALTER TABLE driver_ratings 
ADD COLUMN IF NOT EXISTS car_assignment_id UUID REFERENCES car_assignments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS rating_type TEXT DEFAULT 'contract_completion' CHECK (rating_type IN (
  'contract_completion',
  'ongoing_performance',
  'other'
)),
ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Add index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_driver_ratings_car_assignment_id ON driver_ratings(car_assignment_id);

-- Add comments for new columns
COMMENT ON COLUMN driver_ratings.car_assignment_id IS 'Reference to the car assignment this rating is for';
COMMENT ON COLUMN driver_ratings.rating_type IS 'Type of rating (contract completion, ongoing, etc.)';
COMMENT ON COLUMN driver_ratings.would_recommend IS 'Whether the rater would recommend this driver';
COMMENT ON COLUMN driver_ratings.is_anonymous IS 'Whether the rating should be anonymous to the driver';

-- 3. Create contract_terminations table for detailed audit trail
CREATE TABLE contract_terminations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_assignment_id UUID REFERENCES car_assignments(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Termination details
  termination_date DATE NOT NULL,
  termination_reason TEXT NOT NULL CHECK (termination_reason IN (
    'contract_completed', 
    'mutual_agreement', 
    'owner_terminated', 
    'driver_terminated', 
    'violation_of_terms',
    'other'
  )),
  termination_notes TEXT,
  initiated_by UUID REFERENCES profiles(id) NOT NULL,
  
  -- Contract summary
  total_weeks_worked INTEGER,
  total_reports_submitted INTEGER,
  total_earnings DECIMAL(10,2),
  final_mileage INTEGER,
  
  -- Rating status
  rating_provided BOOLEAN DEFAULT false,
  rating_provided_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one termination per assignment
  UNIQUE(car_assignment_id)
);

-- Add indexes for performance
CREATE INDEX idx_contract_terminations_car_id ON contract_terminations(car_id);
CREATE INDEX idx_contract_terminations_driver_id ON contract_terminations(driver_id);
CREATE INDEX idx_contract_terminations_owner_id ON contract_terminations(owner_id);
CREATE INDEX idx_contract_terminations_termination_date ON contract_terminations(termination_date);
CREATE INDEX idx_contract_terminations_rating_provided ON contract_terminations(rating_provided);

-- Enable RLS
ALTER TABLE contract_terminations ENABLE ROW LEVEL SECURITY;

-- Add comments
COMMENT ON TABLE contract_terminations IS 'Audit trail for contract terminations and performance summaries';
COMMENT ON COLUMN contract_terminations.total_weeks_worked IS 'Total number of weeks the driver worked';
COMMENT ON COLUMN contract_terminations.total_reports_submitted IS 'Total number of weekly reports submitted';
COMMENT ON COLUMN contract_terminations.total_earnings IS 'Total earnings for the driver during this contract';
COMMENT ON COLUMN contract_terminations.final_mileage IS 'Final mileage of the car at contract end';
COMMENT ON COLUMN contract_terminations.rating_provided IS 'Whether the owner has provided a rating';

-- 4. Update existing driver_ratings policies
DROP POLICY IF EXISTS "Users can insert driver ratings" ON driver_ratings;

-- Enhanced policy for inserting ratings
CREATE POLICY "Users can insert driver ratings" ON driver_ratings
  FOR INSERT WITH CHECK (
    driver_ratings.rater_id = auth.uid()
    AND (
      -- Can rate drivers after contract termination
      EXISTS (
        SELECT 1 FROM car_assignments ca
        WHERE ca.id = driver_ratings.car_assignment_id
        AND ca.unassigned_at IS NOT NULL
        AND ca.rating_required = true
        AND EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = ca.car_id
          AND c.owner_id = auth.uid()
        )
      )
      OR
      -- Can rate drivers of their current cars (ongoing performance)
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND EXISTS (
          SELECT 1 FROM cars c
          WHERE c.driver_id = driver_ratings.driver_id
          AND c.owner_id = auth.uid()
        )
      )
    )
  );

-- 5. RLS Policies for contract_terminations
CREATE POLICY "Users can view relevant terminations" ON contract_terminations
  FOR SELECT USING (
    owner_id = auth.uid() OR driver_id = auth.uid()
  );

CREATE POLICY "Owners can create terminations" ON contract_terminations
  FOR INSERT WITH CHECK (
    owner_id = auth.uid()
    AND initiated_by = auth.uid()
  );

CREATE POLICY "Owners can update termination rating status" ON contract_terminations
  FOR UPDATE USING (
    owner_id = auth.uid()
  );

-- 6. Create trigger for updated_at on contract_terminations
CREATE TRIGGER update_contract_terminations_updated_at 
  BEFORE UPDATE ON contract_terminations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Database Functions for Contract Termination

-- Function to terminate a contract
CREATE OR REPLACE FUNCTION terminate_contract(
  p_car_assignment_id UUID,
  p_termination_reason TEXT,
  p_termination_notes TEXT DEFAULT NULL,
  p_terminated_by UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
DECLARE
  v_car_id UUID;
  v_driver_id UUID;
  v_owner_id UUID;
  v_total_weeks INTEGER;
  v_total_reports INTEGER;
  v_total_earnings DECIMAL(10,2);
  v_final_mileage INTEGER;
BEGIN
  -- Get assignment details
  SELECT ca.car_id, ca.driver_id, c.owner_id, c.current_mileage
  INTO v_car_id, v_driver_id, v_owner_id, v_final_mileage
  FROM car_assignments ca
  JOIN cars c ON c.id = ca.car_id
  WHERE ca.id = p_car_assignment_id
  AND ca.is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active assignment not found';
  END IF;
  
  -- Check if user has permission to terminate
  IF v_owner_id != p_terminated_by AND v_driver_id != p_terminated_by THEN
    RAISE EXCEPTION 'User not authorized to terminate this contract';
  END IF;
  
  -- Calculate contract summary
  SELECT 
    COUNT(DISTINCT wr.week_start_date),
    COUNT(wr.id),
    COALESCE(SUM(wr.driver_earnings), 0)
  INTO v_total_weeks, v_total_reports, v_total_earnings
  FROM weekly_reports wr
  WHERE wr.car_id = v_car_id
  AND wr.driver_id = v_driver_id
  AND wr.status = 'approved';
  
  -- Update car assignment
  UPDATE car_assignments
  SET 
    unassigned_at = NOW(),
    termination_reason = p_termination_reason,
    termination_notes = p_termination_notes,
    terminated_by = p_terminated_by,
    terminated_at = NOW(),
    is_active = false,
    rating_required = true -- Flag that rating is required
  WHERE id = p_car_assignment_id;
  
  -- Update car status
  UPDATE cars
  SET 
    driver_id = NULL,
    status = 'available'
  WHERE id = v_car_id;
  
  -- Insert contract termination record
  INSERT INTO contract_terminations (
    car_assignment_id,
    car_id,
    driver_id,
    owner_id,
    termination_date,
    termination_reason,
    termination_notes,
    initiated_by,
    total_weeks_worked,
    total_reports_submitted,
    total_earnings,
    final_mileage
  ) VALUES (
    p_car_assignment_id,
    v_car_id,
    v_driver_id,
    v_owner_id,
    CURRENT_DATE,
    p_termination_reason,
    p_termination_notes,
    p_terminated_by,
    v_total_weeks,
    v_total_reports,
    v_total_earnings,
    v_final_mileage
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark rating as provided
CREATE OR REPLACE FUNCTION mark_rating_provided(
  p_car_assignment_id UUID,
  p_rating_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update contract termination to mark rating as provided
  UPDATE contract_terminations
  SET 
    rating_provided = true,
    rating_provided_at = NOW()
  WHERE car_assignment_id = p_car_assignment_id;
  
  -- Update car assignment to remove rating requirement
  UPDATE car_assignments
  SET rating_required = false
  WHERE id = p_car_assignment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get driver's average rating (using existing structure)
CREATE OR REPLACE FUNCTION get_driver_average_rating(p_driver_id UUID)
RETURNS TABLE (
  overall_avg DECIMAL(3,2),
  total_ratings INTEGER,
  recommendation_rate DECIMAL(5,2),
  category_avgs JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::DECIMAL, 2) as overall_avg,
    COUNT(*)::INTEGER as total_ratings,
    ROUND((COUNT(*) FILTER (WHERE would_recommend = true) * 100.0 / COUNT(*))::DECIMAL, 2) as recommendation_rate,
    COALESCE(
      jsonb_object_agg(
        key, 
        ROUND(AVG(value::numeric)::DECIMAL, 2)
      ) FILTER (WHERE categories IS NOT NULL),
      '{}'::jsonb
    ) as category_avgs
  FROM driver_ratings,
  LATERAL jsonb_each_text(COALESCE(categories, '{}'::jsonb))
  WHERE driver_id = p_driver_id
  GROUP BY driver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending ratings for an owner
CREATE OR REPLACE FUNCTION get_pending_ratings(p_owner_id UUID)
RETURNS TABLE (
  termination_id UUID,
  car_assignment_id UUID,
  termination_date DATE,
  termination_reason TEXT,
  total_weeks_worked INTEGER,
  total_earnings DECIMAL(10,2),
  driver_name TEXT,
  car_make TEXT,
  car_model TEXT,
  license_plate TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id as termination_id,
    ct.car_assignment_id,
    ct.termination_date,
    ct.termination_reason,
    ct.total_weeks_worked,
    ct.total_earnings,
    p.full_name as driver_name,
    c.make as car_make,
    c.model as car_model,
    c.license_plate
  FROM contract_terminations ct
  JOIN profiles p ON p.id = ct.driver_id
  JOIN cars c ON c.id = ct.car_id
  WHERE ct.owner_id = p_owner_id
  AND ct.rating_provided = false
  ORDER BY ct.termination_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the migration
COMMENT ON SCHEMA public IS 'Enhanced with contract termination and rating system - Migration 20250923112852';


