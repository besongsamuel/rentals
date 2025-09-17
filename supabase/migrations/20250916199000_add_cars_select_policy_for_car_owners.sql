-- Add select policy to cars table for users who own cars through car_owners table
-- This allows users to view cars they own as additional owners (not just main owners)

-- Create policy for users to view cars they own through car_owners table
CREATE POLICY "Users can view cars they own through car_owners" ON cars
  FOR SELECT USING (
    -- Allow if user is an additional owner of the car (through car_owners table)
    EXISTS (
      SELECT 1 FROM car_owners co
      WHERE co.car_id = cars.id
      AND co.owner_id = auth.uid()
    )
  );

-- Add comment to document the policy
COMMENT ON POLICY "Users can view cars they own through car_owners" ON cars IS 
'Allows users to view cars where they are listed as additional owners in the car_owners table';
