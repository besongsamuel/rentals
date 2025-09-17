-- Fix infinite recursion in car_owners policies
-- The issue is caused by car_owners policies referencing cars table,
-- which can create circular dependencies if cars policies reference car_owners

-- Drop the problematic policy that references cars table
DROP POLICY IF EXISTS "Car owners can view ownership for their cars" ON car_owners;

-- Create a simpler policy that doesn't reference cars table to avoid infinite recursion
CREATE POLICY "Car owners can view ownership for their cars" ON car_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND car_owners.owner_id = auth.uid()
    )
  );

-- Also ensure cars table policies are simple and don't create circular dependencies
-- Drop any existing cars policies that might reference car_owners
DROP POLICY IF EXISTS "Users can view cars they own" ON cars;
DROP POLICY IF EXISTS "Users can view cars they drive" ON cars;
DROP POLICY IF EXISTS "Owners can update cars they own" ON cars;
DROP POLICY IF EXISTS "Owners can insert cars" ON cars;

-- Create simple cars policies that only reference the main owner_id field
CREATE POLICY "Users can view cars they own" ON cars
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view cars they drive" ON cars
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Owners can update cars they own" ON cars
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert cars" ON cars
  FOR INSERT WITH CHECK (owner_id = auth.uid());
