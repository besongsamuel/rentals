-- Fix car_owners INSERT policy to allow car owners to add other owners to their cars
-- The current policy only allows users to insert records where owner_id = auth.uid()
-- But car owners need to be able to add other owners to cars they own

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;

-- Create a new INSERT policy that allows:
-- 1. Users to insert their own car ownership (owner_id = auth.uid())
-- 2. Car owners to add other owners to cars they own
CREATE POLICY "Users can insert car ownership" ON car_owners
  FOR INSERT WITH CHECK (
    -- Allow users to insert their own car ownership
    owner_id = auth.uid()
    OR
    -- Allow car owners to add other owners to cars they own
    -- Check if the authenticated user is the main owner of the car
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_owners.car_id
      AND c.owner_id = auth.uid()
    )
    OR
    -- Allow additional car owners to add other owners to cars they have stake in
    EXISTS (
      SELECT 1 FROM car_owners co
      WHERE co.car_id = car_owners.car_id
      AND co.owner_id = auth.uid()
      AND co.is_primary_owner = true
    )
  );
