-- Clear and recreate database with new schema
-- This migration implements the following changes:
-- 1. Remove user_id from profiles table
-- 2. Make profiles.id a FK to auth.users(id)
-- 3. Create many-to-many relationship for car ownership

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS car_assignments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS income_sources CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS car_owners CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Create profiles table (profiles.id is now FK to auth.users.id)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('driver', 'owner')),
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create cars table (removed owner_id, now uses car_owners junction table)
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT,
  initial_mileage INTEGER NOT NULL DEFAULT 0,
  current_mileage INTEGER NOT NULL DEFAULT 0,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create car_owners junction table for many-to-many relationship
CREATE TABLE car_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  is_primary_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, owner_id)
);

-- 4. Create weekly_reports table
CREATE TABLE weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  start_mileage INTEGER NOT NULL,
  end_mileage INTEGER NOT NULL,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  driver_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  maintenance_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, week_start_date)
);

-- 5. Create income_sources table
CREATE TABLE income_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rentals', 'ride_share')),
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE NOT NULL,
  commenter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create car_assignments table for historical tracking
CREATE TABLE car_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_cars_driver_id ON cars(driver_id);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_car_owners_car_id ON car_owners(car_id);
CREATE INDEX idx_car_owners_owner_id ON car_owners(owner_id);
CREATE INDEX idx_weekly_reports_car_id ON weekly_reports(car_id);
CREATE INDEX idx_weekly_reports_driver_id ON weekly_reports(driver_id);
CREATE INDEX idx_weekly_reports_status ON weekly_reports(status);
CREATE INDEX idx_income_sources_weekly_report_id ON income_sources(weekly_report_id);
CREATE INDEX idx_comments_weekly_report_id ON comments(weekly_report_id);
CREATE INDEX idx_car_assignments_car_id ON car_assignments(car_id);
CREATE INDEX idx_car_assignments_driver_id ON car_assignments(driver_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for cars
CREATE POLICY "Users can view cars they own or drive" ON cars
  FOR SELECT USING (
    id IN (
      SELECT car_id FROM car_owners WHERE owner_id = auth.uid()
      UNION
      SELECT id FROM cars WHERE driver_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert cars" ON cars
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can update cars they own" ON cars
  FOR UPDATE USING (
    id IN (SELECT car_id FROM car_owners WHERE owner_id = auth.uid())
  );

-- Create RLS policies for car_owners
CREATE POLICY "Users can view car ownership for cars they own or drive" ON car_owners
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    car_id IN (SELECT id FROM cars WHERE driver_id = auth.uid())
  );

CREATE POLICY "Users can insert car ownership for cars they own" ON car_owners
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update car ownership they own" ON car_owners
  FOR UPDATE USING (owner_id = auth.uid());

-- Create RLS policies for weekly_reports
CREATE POLICY "Drivers can view their own reports" ON weekly_reports
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Owners can view reports for their cars" ON weekly_reports
  FOR SELECT USING (
    car_id IN (SELECT car_id FROM car_owners WHERE owner_id = auth.uid())
  );

CREATE POLICY "Drivers can insert their own reports" ON weekly_reports
  FOR INSERT WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can update their own reports" ON weekly_reports
  FOR UPDATE USING (driver_id = auth.uid());

CREATE POLICY "Owners can approve/reject reports for their cars" ON weekly_reports
  FOR UPDATE USING (
    car_id IN (SELECT car_id FROM car_owners WHERE owner_id = auth.uid())
  );

-- Create RLS policies for income_sources
CREATE POLICY "Users can view income sources for their reports" ON income_sources
  FOR SELECT USING (
    weekly_report_id IN (
      SELECT id FROM weekly_reports WHERE driver_id = auth.uid()
      UNION
      SELECT id FROM weekly_reports WHERE car_id IN (
        SELECT car_id FROM car_owners WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Drivers can manage income sources for their reports" ON income_sources
  FOR ALL USING (
    weekly_report_id IN (SELECT id FROM weekly_reports WHERE driver_id = auth.uid())
  );

-- Create RLS policies for comments
CREATE POLICY "Users can view comments for reports they can access" ON comments
  FOR SELECT USING (
    weekly_report_id IN (
      SELECT id FROM weekly_reports WHERE driver_id = auth.uid()
      UNION
      SELECT id FROM weekly_reports WHERE car_id IN (
        SELECT car_id FROM car_owners WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert comments for reports they can access" ON comments
  FOR INSERT WITH CHECK (
    commenter_id = auth.uid() AND
    weekly_report_id IN (
      SELECT id FROM weekly_reports WHERE driver_id = auth.uid()
      UNION
      SELECT id FROM weekly_reports WHERE car_id IN (
        SELECT car_id FROM car_owners WHERE owner_id = auth.uid()
      )
    )
  );

-- Create RLS policies for car_assignments
CREATE POLICY "Users can view car assignments for their cars" ON car_assignments
  FOR SELECT USING (
    car_id IN (SELECT car_id FROM car_owners WHERE owner_id = auth.uid()) OR
    driver_id = auth.uid()
  );

CREATE POLICY "Owners can manage car assignments for their cars" ON car_assignments
  FOR ALL USING (
    car_id IN (SELECT car_id FROM car_owners WHERE owner_id = auth.uid())
  );

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_owners_updated_at BEFORE UPDATE ON car_owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at BEFORE UPDATE ON weekly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
