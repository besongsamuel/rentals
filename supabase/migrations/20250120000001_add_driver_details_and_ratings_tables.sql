-- Add driver_details and driver_ratings tables
-- This migration creates comprehensive driver information tables for better driver selection

-- 1. Create driver_details table
CREATE TABLE driver_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Personal Information
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  nationality TEXT,
  languages TEXT[], -- Array of languages spoken
  
  -- Contact Information
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroon',
  
  -- Driver License Information
  license_number TEXT UNIQUE,
  license_issue_date DATE,
  license_expiry_date DATE,
  license_class TEXT, -- A, B, C, etc.
  license_issuing_authority TEXT,
  
  -- Professional Information
  years_of_experience INTEGER DEFAULT 0,
  preferred_transmission TEXT CHECK (preferred_transmission IN ('manual', 'automatic', 'both')),
  
  -- Availability
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_break')),
  preferred_working_hours JSONB, -- {"start": "08:00", "end": "18:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]}
  
  -- Preferences
  communication_preference TEXT DEFAULT 'phone' CHECK (communication_preference IN ('phone', 'email', 'sms', 'whatsapp')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create driver_ratings table
CREATE TABLE driver_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Usually car owner
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories JSONB, -- {"punctuality": 5, "communication": 4, "vehicle_care": 5, "safety": 5}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on both tables
ALTER TABLE driver_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_ratings ENABLE ROW LEVEL SECURITY;

-- 4. Create indexes for better performance
CREATE INDEX idx_driver_details_profile_id ON driver_details(profile_id);
CREATE INDEX idx_driver_details_availability_status ON driver_details(availability_status);
CREATE INDEX idx_driver_details_city ON driver_details(city);
CREATE INDEX idx_driver_details_state_province ON driver_details(state_province);
CREATE INDEX idx_driver_details_license_expiry_date ON driver_details(license_expiry_date);
CREATE INDEX idx_driver_details_years_of_experience ON driver_details(years_of_experience);

CREATE INDEX idx_driver_ratings_driver_id ON driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_rater_id ON driver_ratings(rater_id);
CREATE INDEX idx_driver_ratings_car_id ON driver_ratings(car_id);
CREATE INDEX idx_driver_ratings_rating ON driver_ratings(rating);
CREATE INDEX idx_driver_ratings_created_at ON driver_ratings(created_at);

-- 5. Create triggers for updated_at
CREATE TRIGGER update_driver_details_updated_at 
  BEFORE UPDATE ON driver_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_ratings_updated_at 
  BEFORE UPDATE ON driver_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS Policies for driver_details

-- Any authenticated owner can view all driver details
CREATE POLICY "Owners can view all driver details" ON driver_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
    )
  );

-- Drivers can view and update their own details
CREATE POLICY "Drivers can view their own details" ON driver_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND driver_details.profile_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can insert their own details" ON driver_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND driver_details.profile_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update their own details" ON driver_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND driver_details.profile_id = auth.uid()
    )
  );

-- 7. RLS Policies for driver_ratings

-- Any authenticated owner can view all driver ratings
CREATE POLICY "Owners can view all driver ratings" ON driver_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
    )
  );

-- Drivers can only view their own ratings
CREATE POLICY "Drivers can view their own ratings" ON driver_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND driver_ratings.driver_id = auth.uid()
    )
  );

-- Users can insert ratings for drivers they have access to
CREATE POLICY "Users can insert driver ratings" ON driver_ratings
  FOR INSERT WITH CHECK (
    driver_ratings.rater_id = auth.uid()
    AND (
      -- Can rate drivers of their cars
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND EXISTS (
          SELECT 1 FROM cars c
          WHERE c.driver_id = driver_ratings.driver_id
          AND EXISTS (
            SELECT 1 FROM car_owners co
            WHERE co.car_id = c.id
            AND co.owner_id = auth.uid()
          )
        )
      )
    )
  );

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings" ON driver_ratings
  FOR UPDATE USING (driver_ratings.rater_id = auth.uid())
  WITH CHECK (driver_ratings.rater_id = auth.uid());

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings" ON driver_ratings
  FOR DELETE USING (driver_ratings.rater_id = auth.uid());

-- 8. Add comments for documentation
COMMENT ON TABLE driver_details IS 'Extended driver information for better driver selection and management';
COMMENT ON TABLE driver_ratings IS 'Driver performance ratings and feedback from car owners';

COMMENT ON COLUMN driver_details.languages IS 'Array of languages the driver can speak';
COMMENT ON COLUMN driver_details.preferred_working_hours IS 'JSON object with preferred working schedule';
COMMENT ON COLUMN driver_details.availability_status IS 'Current availability status of the driver';
COMMENT ON COLUMN driver_details.communication_preference IS 'Preferred method of communication';

COMMENT ON COLUMN driver_ratings.categories IS 'JSON object with detailed rating categories';
COMMENT ON COLUMN driver_ratings.rater_id IS 'ID of the user who gave the rating (usually car owner)';
