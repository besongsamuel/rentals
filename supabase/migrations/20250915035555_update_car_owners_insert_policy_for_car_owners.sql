-- Update car_owners INSERT policy to allow car owners to add other owners to their cars
-- This allows inserts when the currently logged user is the car owner (cars.owner_id = auth.uid())
-- The car owner can insert new records for different owners on cars they own

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own car ownership" ON car_owners;
DROP POLICY IF EXISTS "Users can insert car ownership" ON car_owners;
DROP POLICY IF EXISTS "Allow car ownership management" ON car_owners;

-- Create a new INSERT policy that allows:
-- 1. Users to insert their own car ownership (owner_id = auth.uid())
-- 2. Car owners (cars.owner_id = auth.uid()) to add other owners to cars they own
-- 3. This specifically allows car owners to insert records for different owners on their cars
CREATE POLICY "Allow car owners to add other owners" ON car_owners
  FOR INSERT WITH CHECK (
    -- Allow users to insert their own car ownership
    owner_id = auth.uid()
    OR
    -- Allow car owners to add other owners to cars they own
    -- This is the key permission: cars.owner_id = auth.uid() can insert for any owner_id
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_owners.car_id
      AND c.owner_id = auth.uid()
    )
  );
