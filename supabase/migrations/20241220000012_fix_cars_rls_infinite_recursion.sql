-- Fix infinite recursion in cars table RLS policies
-- The issue is caused by circular dependencies between cars and car_owners policies

-- Drop existing problematic policies for cars table
DROP POLICY IF EXISTS "Users can view cars they own or drive" ON cars;
DROP POLICY IF EXISTS "Owners can update cars they own" ON cars;

-- Create simpler, non-recursive policies for cars table
-- These policies avoid referencing car_owners table to prevent circular dependencies

CREATE POLICY "Users can view cars they drive" ON cars
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Users can view cars they own" ON cars
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM car_owners 
      WHERE car_owners.car_id = cars.id 
      AND car_owners.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update cars they own" ON cars
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM car_owners 
      WHERE car_owners.car_id = cars.id 
      AND car_owners.owner_id = auth.uid()
    )
  );

-- Also ensure car_owners policies are simple and non-recursive
DROP POLICY IF EXISTS "Users can view their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can update their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can delete their own car ownership" ON car_owners;

CREATE POLICY "Users can view their own car ownership" ON car_owners
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own car ownership" ON car_owners
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own car ownership" ON car_owners
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own car ownership" ON car_owners
  FOR DELETE USING (owner_id = auth.uid());


