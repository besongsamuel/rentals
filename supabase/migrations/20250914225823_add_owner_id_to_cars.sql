-- Add owner_id column to cars table to track the main car owner
-- This will work alongside the car_owners table which tracks additional owners

-- Add the owner_id column to cars table
ALTER TABLE cars ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Update the RLS policies to work with the new owner_id column
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their cars" ON cars;
DROP POLICY IF EXISTS "Users can update their cars" ON cars;
DROP POLICY IF EXISTS "Users can delete their cars" ON cars;

-- Create updated SELECT policy
CREATE POLICY "Users can view their cars" ON cars
  FOR SELECT USING (
    -- User can see cars they are the main owner of
    owner_id = auth.uid()
    OR
    -- User can see cars they have ownership stake in (through car_owners table)
    EXISTS (
      SELECT 1 FROM car_owners co 
      WHERE co.car_id = cars.id 
      AND co.owner_id = auth.uid()
    )
    OR
    -- User can see cars they are assigned to drive
    driver_id = auth.uid()
    OR
    -- Owners can see all cars for management purposes
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'owner'
    )
  );

-- Create updated UPDATE policy
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
  );

-- Create updated DELETE policy
CREATE POLICY "Users can delete their cars" ON cars
  FOR DELETE USING (
    -- Only main owner can delete cars
    owner_id = auth.uid()
    OR
    -- Additional owners can delete if they have significant stake
    EXISTS (
      SELECT 1 FROM car_owners co 
      WHERE co.car_id = cars.id 
      AND co.owner_id = auth.uid()
      AND co.ownership_percentage >= 50.00
    )
  );

-- Add a comment to clarify the relationship
COMMENT ON COLUMN cars.owner_id IS 'Main owner of the car. Additional owners are tracked in car_owners table';
COMMENT ON TABLE car_owners IS 'Tracks additional owners and ownership percentages for cars. Main owner is tracked in cars.owner_id';
