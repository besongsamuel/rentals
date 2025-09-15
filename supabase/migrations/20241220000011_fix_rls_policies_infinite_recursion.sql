-- Fix infinite recursion in RLS policies
-- The issue is caused by circular dependencies in policy definitions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view car ownership for cars they own or drive" ON car_owners;
DROP POLICY IF EXISTS "Users can insert car ownership for cars they own" ON car_owners;
DROP POLICY IF EXISTS "Users can update car ownership they own" ON car_owners;

DROP POLICY IF EXISTS "Owners can view reports for their cars" ON weekly_reports;
DROP POLICY IF EXISTS "Owners can approve/reject reports for their cars" ON weekly_reports;

DROP POLICY IF EXISTS "Users can view income sources for their reports" ON income_sources;
DROP POLICY IF EXISTS "Users can view comments for reports they can access" ON comments;
DROP POLICY IF EXISTS "Users can insert comments for reports they can access" ON comments;
DROP POLICY IF EXISTS "Users can view car assignments for their cars" ON car_assignments;
DROP POLICY IF EXISTS "Owners can manage car assignments for their cars" ON car_assignments;

-- Create simpler, non-recursive policies for car_owners
CREATE POLICY "Users can view their own car ownership" ON car_owners
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own car ownership" ON car_owners
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own car ownership" ON car_owners
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own car ownership" ON car_owners
  FOR DELETE USING (owner_id = auth.uid());

-- Create simpler policies for weekly_reports that don't reference car_owners
CREATE POLICY "Owners can view reports for their cars" ON weekly_reports
  FOR SELECT USING (
    car_id IN (
      SELECT cars.id FROM cars 
      WHERE cars.id IN (
        SELECT car_owners.car_id FROM car_owners 
        WHERE car_owners.owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners can approve/reject reports for their cars" ON weekly_reports
  FOR UPDATE USING (
    car_id IN (
      SELECT cars.id FROM cars 
      WHERE cars.id IN (
        SELECT car_owners.car_id FROM car_owners 
        WHERE car_owners.owner_id = auth.uid()
      )
    )
  );

-- Create simpler policies for income_sources
CREATE POLICY "Users can view income sources for their reports" ON income_sources
  FOR SELECT USING (
    weekly_report_id IN (
      SELECT id FROM weekly_reports WHERE driver_id = auth.uid()
      UNION
      SELECT wr.id FROM weekly_reports wr
      JOIN car_owners co ON wr.car_id = co.car_id
      WHERE co.owner_id = auth.uid()
    )
  );

-- Create simpler policies for comments
CREATE POLICY "Users can view comments for reports they can access" ON comments
  FOR SELECT USING (
    weekly_report_id IN (
      SELECT id FROM weekly_reports WHERE driver_id = auth.uid()
      UNION
      SELECT wr.id FROM weekly_reports wr
      JOIN car_owners co ON wr.car_id = co.car_id
      WHERE co.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments for reports they can access" ON comments
  FOR INSERT WITH CHECK (
    commenter_id = auth.uid() AND
    weekly_report_id IN (
      SELECT id FROM weekly_reports WHERE driver_id = auth.uid()
      UNION
      SELECT wr.id FROM weekly_reports wr
      JOIN car_owners co ON wr.car_id = co.car_id
      WHERE co.owner_id = auth.uid()
    )
  );

-- Create simpler policies for car_assignments
CREATE POLICY "Users can view car assignments for their cars" ON car_assignments
  FOR SELECT USING (
    car_id IN (
      SELECT co.car_id FROM car_owners co WHERE co.owner_id = auth.uid()
    ) OR driver_id = auth.uid()
  );

CREATE POLICY "Owners can manage car assignments for their cars" ON car_assignments
  FOR ALL USING (
    car_id IN (
      SELECT co.car_id FROM car_owners co WHERE co.owner_id = auth.uid()
    )
  );


