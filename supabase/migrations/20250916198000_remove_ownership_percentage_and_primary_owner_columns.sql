-- Remove ownership_percentage and is_primary_owner columns from car_owners table
-- These columns are no longer needed for the simplified ownership model

-- First, drop all policies that depend on these columns
-- Drop cars table policies
DROP POLICY IF EXISTS "Users can delete their cars" ON cars;
DROP POLICY IF EXISTS "Users can view their cars" ON cars;
DROP POLICY IF EXISTS "Users can update their cars" ON cars;

-- Drop car_owners table policies
DROP POLICY IF EXISTS "Allow car ownership updates" ON car_owners;
DROP POLICY IF EXISTS "Allow car ownership deletion" ON car_owners;
DROP POLICY IF EXISTS "Users can view their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can update their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can delete their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Car owners can view car ownership" ON car_owners;
DROP POLICY IF EXISTS "Car owners can view ownership for their cars" ON car_owners;

-- Drop the ownership_percentage column
ALTER TABLE car_owners DROP COLUMN IF EXISTS ownership_percentage;

-- Drop the is_primary_owner column
ALTER TABLE car_owners DROP COLUMN IF EXISTS is_primary_owner;

-- Recreate simplified policies without the removed columns
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view cars they own" ON cars;
DROP POLICY IF EXISTS "Users can view cars they drive" ON cars;
DROP POLICY IF EXISTS "Owners can update cars they own" ON cars;
DROP POLICY IF EXISTS "Owners can insert cars" ON cars;
DROP POLICY IF EXISTS "Owners can delete cars they own" ON cars;

CREATE POLICY "Users can view cars they own" ON cars
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view cars they drive" ON cars
  FOR SELECT USING (driver_id = auth.uid());

CREATE POLICY "Owners can update cars they own" ON cars
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert cars" ON cars
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete cars they own" ON cars
  FOR DELETE USING (owner_id = auth.uid());

-- Recreate simplified car_owners policies
CREATE POLICY "Car owners can view car ownership" ON car_owners
  FOR SELECT USING (
    -- Allow any authenticated user to view car ownership records
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Car owners can view ownership for their cars" ON car_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND car_owners.owner_id = auth.uid()
    )
  );

CREATE POLICY "Car owners can insert ownership" ON car_owners
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Car owners can update ownership" ON car_owners
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Car owners can delete ownership" ON car_owners
  FOR DELETE USING (owner_id = auth.uid());

-- Add comment to document the simplified ownership model
COMMENT ON TABLE car_owners IS 'Car ownership table - simplified model without percentage or primary owner flags';
