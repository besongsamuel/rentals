-- Migration: Create car assignment request system
-- This migration creates tables and policies for drivers to request car assignments
-- Date: 2025-09-30

-- ============================================================================
-- 1. CREATE MAIN TABLES
-- ============================================================================

-- Car Assignment Requests Table
CREATE TABLE IF NOT EXISTS car_assignment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core relationships
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Request status and workflow
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn', 'expired')),
  
  -- Driver's availability information (not in profile)
  available_start_date DATE NOT NULL,
  available_end_date DATE, -- NULL means indefinite availability
  preferred_working_hours JSONB, -- Flexible structure for working hours preferences
  max_hours_per_week INTEGER, -- Optional constraint on weekly hours
  
  -- Additional driver information for this specific request
  driver_notes TEXT, -- Why they want this car, special requests, etc.
  experience_details TEXT, -- Specific experience relevant to this car type
  
  -- Owner decision tracking
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id), -- In case of multiple owners
  rejection_reason TEXT, -- Optional reason for rejection
  owner_notes TEXT, -- Owner's private notes about the request
  
  -- Request metadata
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CHECK (available_end_date IS NULL OR available_end_date >= available_start_date)
);

-- Create partial unique index for one pending request per driver-car pair
CREATE UNIQUE INDEX idx_car_requests_unique_pending 
  ON car_assignment_requests(car_id, driver_id) 
  WHERE status = 'pending';

-- Indexes for performance
CREATE INDEX idx_car_requests_car_id ON car_assignment_requests(car_id);
CREATE INDEX idx_car_requests_driver_id ON car_assignment_requests(driver_id);
CREATE INDEX idx_car_requests_owner_id ON car_assignment_requests(owner_id);
CREATE INDEX idx_car_requests_status ON car_assignment_requests(status);
CREATE INDEX idx_car_requests_created_at ON car_assignment_requests(created_at DESC);
CREATE INDEX idx_car_requests_expires_at ON car_assignment_requests(expires_at) WHERE status = 'pending';

-- Composite index for owner's pending requests view
CREATE INDEX idx_car_requests_owner_pending 
  ON car_assignment_requests(owner_id, status, created_at DESC) 
  WHERE status = 'pending';

-- Assignment Request Messages Table
CREATE TABLE IF NOT EXISTS assignment_request_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationships
  request_id UUID REFERENCES car_assignment_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_message_id UUID REFERENCES assignment_request_messages(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  is_internal BOOLEAN DEFAULT false, -- For owner's internal notes (not visible to driver)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_request_messages_request_id ON assignment_request_messages(request_id);
CREATE INDEX idx_request_messages_user_id ON assignment_request_messages(user_id);
CREATE INDEX idx_request_messages_parent_id ON assignment_request_messages(parent_message_id);
CREATE INDEX idx_request_messages_created_at ON assignment_request_messages(created_at DESC);

-- Assignment Request History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS assignment_request_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationships
  request_id UUID REFERENCES car_assignment_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Status tracking
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  
  -- Change details
  action TEXT NOT NULL, -- created, approved, rejected, withdrawn, expired, updated
  notes TEXT,
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for history
CREATE INDEX idx_request_history_request_id ON assignment_request_history(request_id);
CREATE INDEX idx_request_history_created_at ON assignment_request_history(created_at DESC);

-- ============================================================================
-- 2. CREATE FUNCTIONS
-- ============================================================================

-- Function to auto-expire old pending requests
CREATE OR REPLACE FUNCTION expire_old_assignment_requests()
RETURNS void AS $$
BEGIN
  UPDATE car_assignment_requests
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if driver profile is complete enough to send requests
CREATE OR REPLACE FUNCTION can_driver_send_request(driver_profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  driver_details_exists BOOLEAN;
  has_required_fields BOOLEAN;
BEGIN
  -- Check if driver_details record exists
  SELECT EXISTS (
    SELECT 1 FROM driver_details 
    WHERE profile_id = driver_profile_id
  ) INTO driver_details_exists;
  
  IF NOT driver_details_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if required fields are filled
  SELECT 
    license_number IS NOT NULL 
    AND license_expiry_date IS NOT NULL
    AND years_of_experience IS NOT NULL
    AND date_of_birth IS NOT NULL
  INTO has_required_fields
  FROM driver_details
  WHERE profile_id = driver_profile_id;
  
  RETURN has_required_fields;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log request status changes
CREATE OR REPLACE FUNCTION log_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed or new record
  IF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) OR TG_OP = 'INSERT' THEN
    INSERT INTO assignment_request_history (
      request_id,
      user_id,
      previous_status,
      new_status,
      action,
      notes
    ) VALUES (
      NEW.id,
      COALESCE(NEW.reviewed_by, NEW.driver_id),
      COALESCE(OLD.status, 'none'),
      NEW.status,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'created'
        WHEN NEW.status = 'approved' THEN 'approved'
        WHEN NEW.status = 'rejected' THEN 'rejected'
        WHEN NEW.status = 'withdrawn' THEN 'withdrawn'
        WHEN NEW.status = 'expired' THEN 'expired'
        ELSE 'updated'
      END,
      CASE 
        WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
        ELSE NULL
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. CREATE TRIGGERS
-- ============================================================================

-- Trigger to automatically log status changes
CREATE TRIGGER trigger_log_request_status_change
  AFTER INSERT OR UPDATE ON car_assignment_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_request_status_change();

-- Trigger to update updated_at on car_assignment_requests
CREATE TRIGGER update_car_assignment_requests_updated_at
  BEFORE UPDATE ON car_assignment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on assignment_request_messages
CREATE TRIGGER update_assignment_request_messages_updated_at
  BEFORE UPDATE ON assignment_request_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE car_assignment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_request_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES - car_assignment_requests
-- ============================================================================

-- Drivers can view their own requests
CREATE POLICY "Drivers can view their own requests" 
  ON car_assignment_requests
  FOR SELECT
  USING (driver_id = auth.uid());

-- Owners can view requests for their cars
CREATE POLICY "Owners can view requests for their cars"
  ON car_assignment_requests
  FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM car_owners co
      WHERE co.car_id = car_assignment_requests.car_id
      AND co.owner_id = auth.uid()
    )
  );

-- Drivers can create requests for available cars
CREATE POLICY "Drivers can create requests"
  ON car_assignment_requests
  FOR INSERT
  WITH CHECK (
    driver_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
    )
    AND EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_id
      AND c.is_available = true
      AND c.status = 'available'
    )
  );

-- Drivers can withdraw their own pending requests
CREATE POLICY "Drivers can withdraw their pending requests"
  ON car_assignment_requests
  FOR UPDATE
  USING (
    driver_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    driver_id = auth.uid()
    AND status = 'withdrawn'
  );

-- Owners can approve or reject requests for their cars
CREATE POLICY "Owners can respond to requests for their cars"
  ON car_assignment_requests
  FOR UPDATE
  USING (
    (
      owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM car_owners co
        WHERE co.car_id = car_assignment_requests.car_id
        AND co.owner_id = auth.uid()
      )
    )
    AND status = 'pending'
  )
  WITH CHECK (
    status IN ('approved', 'rejected')
    AND reviewed_by = auth.uid()
  );

-- ============================================================================
-- 6. CREATE RLS POLICIES - assignment_request_messages
-- ============================================================================

-- Users can view messages for requests they're involved in (drivers see non-internal, owners see all)
CREATE POLICY "Users can view messages for their requests"
  ON assignment_request_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM car_assignment_requests r
      WHERE r.id = assignment_request_messages.request_id
      AND (r.driver_id = auth.uid() OR r.owner_id = auth.uid())
    )
    AND (
      -- Non-internal messages visible to all
      is_internal = false 
      OR 
      -- Internal messages only visible to owners
      EXISTS (
        SELECT 1 FROM car_assignment_requests r
        WHERE r.id = assignment_request_messages.request_id
        AND (
          r.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = r.car_id
            AND co.owner_id = auth.uid()
          )
        )
      )
    )
  );

-- Users can add messages to requests they're involved in
CREATE POLICY "Users can add messages to their requests"
  ON assignment_request_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM car_assignment_requests r
      WHERE r.id = request_id
      AND (
        r.driver_id = auth.uid() 
        OR r.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = r.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON assignment_request_messages
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON assignment_request_messages
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 7. CREATE RLS POLICIES - assignment_request_history
-- ============================================================================

-- Users can view history for requests they're involved in
CREATE POLICY "Users can view history for their requests"
  ON assignment_request_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM car_assignment_requests r
      WHERE r.id = assignment_request_history.request_id
      AND (
        r.driver_id = auth.uid() 
        OR r.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = r.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- 8. ADD TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE car_assignment_requests IS 'Driver requests to be assigned to available cars';
COMMENT ON TABLE assignment_request_messages IS 'Communication thread between drivers and owners about assignment requests';
COMMENT ON TABLE assignment_request_history IS 'Audit trail of all request status changes';

COMMENT ON COLUMN car_assignment_requests.status IS 'Request lifecycle: pending → approved/rejected/withdrawn/expired';
COMMENT ON COLUMN car_assignment_requests.expires_at IS 'Requests auto-expire after 30 days if not reviewed';
COMMENT ON COLUMN assignment_request_messages.is_internal IS 'When true, message is only visible to car owners';
