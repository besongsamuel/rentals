-- Fix car_owners RLS policy to allow car owners to add other owners to their cars
-- This resolves the "new row violates row-level security policy for table car_owners" error

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can insert car ownership" ON car_owners;

-- Create a comprehensive INSERT policy that allows:
-- 1. Users to insert their own car ownership (owner_id = auth.uid())
-- 2. Main car owners to add other owners to cars they own
-- 3. Primary additional owners to add other owners to cars they have stake in
CREATE POLICY "Allow car ownership management" ON car_owners
  FOR INSERT WITH CHECK (
    -- Allow users to insert their own car ownership
    owner_id = auth.uid()
    OR
    -- Allow main car owners to add other owners to cars they own
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_owners.car_id
      AND c.owner_id = auth.uid()
    )
    OR
    -- Allow primary additional owners to add other owners to cars they have stake in
    EXISTS (
      SELECT 1 FROM car_owners co
      WHERE co.car_id = car_owners.car_id
      AND co.owner_id = auth.uid()
      AND co.is_primary_owner = true
    )
    OR
    -- Allow any user with owner role to manage car ownership
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
    )
  );

-- Also ensure we have proper UPDATE and DELETE policies for car ownership management
DROP POLICY IF EXISTS "Users can update their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can delete their own car ownership" ON car_owners;

CREATE POLICY "Allow car ownership updates" ON car_owners
  FOR UPDATE USING (
    -- Users can update their own car ownership
    owner_id = auth.uid()
    OR
    -- Main car owners can update ownership for cars they own
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_owners.car_id
      AND c.owner_id = auth.uid()
    )
    OR
    -- Primary additional owners can update ownership for cars they have stake in
    EXISTS (
      SELECT 1 FROM car_owners co
      WHERE co.car_id = car_owners.car_id
      AND co.owner_id = auth.uid()
      AND co.is_primary_owner = true
    )
    OR
    -- Any user with owner role can manage car ownership
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
    )
  );

CREATE POLICY "Allow car ownership deletion" ON car_owners
  FOR DELETE USING (
    -- Users can delete their own car ownership
    owner_id = auth.uid()
    OR
    -- Main car owners can delete ownership for cars they own
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_owners.car_id
      AND c.owner_id = auth.uid()
    )
    OR
    -- Primary additional owners can delete ownership for cars they have stake in
    EXISTS (
      SELECT 1 FROM car_owners co
      WHERE co.car_id = car_owners.car_id
      AND co.owner_id = auth.uid()
      AND co.is_primary_owner = true
    )
    OR
    -- Any user with owner role can manage car ownership
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
    )
  );
