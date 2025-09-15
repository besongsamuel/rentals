-- Allow car owners to view weekly reports for cars they own
-- This includes both main owners (cars.owner_id) and additional owners (car_owners table)

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view own reports" ON weekly_reports;

-- Create new policy allowing car owners to view reports for their cars
CREATE POLICY "Car owners can view weekly reports" ON weekly_reports
  FOR SELECT TO authenticated
  USING (
    -- Allow if user is the driver who created the report
    driver_id = auth.uid()
    OR
    -- Allow if user is the main owner of the car
    car_id IN (
      SELECT id FROM cars WHERE owner_id = auth.uid()
    )
    OR
    -- Allow if user is an additional owner of the car
    car_id IN (
      SELECT car_id FROM car_owners WHERE owner_id = auth.uid()
    )
  );
