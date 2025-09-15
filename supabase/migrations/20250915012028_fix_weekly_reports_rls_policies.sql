-- Fix weekly_reports RLS policies to allow car owners to view and approve reports
-- This includes both main owners (cars.owner_id) and additional owners (car_owners table)

-- Drop all existing weekly_reports policies to start fresh
DROP POLICY IF EXISTS "Drivers can view own reports" ON weekly_reports;
DROP POLICY IF EXISTS "Drivers can view their own reports" ON weekly_reports;
DROP POLICY IF EXISTS "Car owners can view weekly reports" ON weekly_reports;
DROP POLICY IF EXISTS "Owners can view reports for their cars" ON weekly_reports;
DROP POLICY IF EXISTS "Drivers can insert own reports" ON weekly_reports;
DROP POLICY IF EXISTS "Drivers can insert their own reports" ON weekly_reports;
DROP POLICY IF EXISTS "Drivers can update own reports" ON weekly_reports;
DROP POLICY IF EXISTS "Drivers can update their own reports" ON weekly_reports;
DROP POLICY IF EXISTS "Owners can approve reports" ON weekly_reports;
DROP POLICY IF EXISTS "Owners can approve/reject reports for their cars" ON weekly_reports;

-- Create comprehensive SELECT policy for weekly_reports
CREATE POLICY "Users can view relevant weekly reports" ON weekly_reports
  FOR SELECT TO authenticated
  USING (
    -- Allow if user is the driver who created the report
    driver_id = auth.uid()
    OR
    -- Allow if user is the main owner of the car
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = weekly_reports.car_id 
      AND cars.owner_id = auth.uid()
    )
    OR
    -- Allow if user is an additional owner of the car
    EXISTS (
      SELECT 1 FROM car_owners 
      WHERE car_owners.car_id = weekly_reports.car_id 
      AND car_owners.owner_id = auth.uid()
    )
  );

-- Create INSERT policy for drivers
CREATE POLICY "Drivers can insert their own reports" ON weekly_reports
  FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- Create UPDATE policy for drivers (only for draft reports)
CREATE POLICY "Drivers can update their own draft reports" ON weekly_reports
  FOR UPDATE TO authenticated
  USING (
    driver_id = auth.uid() 
    AND status = 'draft'
  );

-- Create UPDATE policy for car owners to approve/reject reports
CREATE POLICY "Car owners can approve/reject reports" ON weekly_reports
  FOR UPDATE TO authenticated
  USING (
    -- Allow if user is the main owner of the car
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = weekly_reports.car_id 
      AND cars.owner_id = auth.uid()
    )
    OR
    -- Allow if user is an additional owner of the car
    EXISTS (
      SELECT 1 FROM car_owners 
      WHERE car_owners.car_id = weekly_reports.car_id 
      AND car_owners.owner_id = auth.uid()
    )
  );
