-- Fix car assignment RLS policy issue
-- The problem is that car owners cannot assign cars to drivers because the UPDATE policy
-- is too restrictive. We need to allow car owners to update cars for assignment purposes.

-- Drop the existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Users can update their cars" ON cars;

-- Create a more permissive UPDATE policy that allows car owners to assign cars
CREATE POLICY "Users can update their cars" ON cars
  FOR UPDATE USING (
    -- Main owner can update the car
    owner_id = auth.uid()
    OR
    -- Additional owners can update cars they have stake in
    EXISTS (
      SELECT 1 FROM car_owners co 
      WHERE co.car_id = cars.id 
      AND co.owner_id = auth.uid()
    )
    OR
    -- Drivers can update cars they are assigned to (for mileage updates, etc.)
    driver_id = auth.uid()
    OR
    -- Allow any car owner (from profiles table with user_type='owner') to assign cars
    -- This is needed for the car assignment functionality to work
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'owner'
    )
  );

-- Also ensure we have proper policies for car_assignments table
-- Drop and recreate to ensure they're correct
DROP POLICY IF EXISTS "Owners can assign cars" ON car_assignments;
DROP POLICY IF EXISTS "Users can view relevant assignments" ON car_assignments;
DROP POLICY IF EXISTS "Owners can update assignments" ON car_assignments;

-- Create car_assignments policies
CREATE POLICY "Users can view relevant assignments" ON car_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_assignments.car_id
      AND (c.owner_id = auth.uid() OR c.driver_id = auth.uid())
    )
  );

CREATE POLICY "Owners can assign cars" ON car_assignments
  FOR INSERT WITH CHECK (
    -- Allow car owners to create assignments
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'owner'
    )
  );

CREATE POLICY "Owners can update assignments" ON car_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'owner'
    )
  );
