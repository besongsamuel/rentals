-- Update car_owners INSERT policy to allow car owners to add other owners to their cars
-- This allows inserts when the currently logged user is the car owner (car.owner_id = auth.uid())

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can insert car ownership" ON car_owners;
DROP POLICY IF EXISTS "Allow car ownership management" ON car_owners;

-- Create a new INSERT policy that allows:
-- 1. Users to insert their own car ownership (owner_id = auth.uid())
-- 2. Car owners to add other owners to cars they own (car.owner_id = auth.uid())
CREATE POLICY "Allow car owners to manage ownership" ON car_owners
  FOR INSERT WITH CHECK (
    -- Allow users to insert their own car ownership
    owner_id = auth.uid()
    OR
    -- Allow car owners to add other owners to cars they own
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_owners.car_id
      AND c.owner_id = auth.uid()
    )
  );
