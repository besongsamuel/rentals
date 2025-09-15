-- Fix cars table INSERT policy to allow car creation
-- The current policy is blocking car insertions

-- Drop any existing INSERT policies for cars table
DROP POLICY IF EXISTS "Owners can insert cars" ON cars;

-- Create a new INSERT policy that allows authenticated users to insert cars
-- Since we're using a many-to-many relationship with car_owners, we need to allow
-- the car to be created first, then the ownership relationship can be established
CREATE POLICY "Authenticated users can insert cars" ON cars
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure we have proper policies for car_owners table
-- Drop and recreate to ensure they're correct
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can view their own car ownership" ON car_owners;
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


