-- Update RLS policies to allow car owners to view reports and other car owners
-- This migration updates policies to include car owners from the car_owners table

-- Update the weekly_reports policy for owners to include car owners from car_owners table
DROP POLICY IF EXISTS "Owners can view weekly reports for cars they own" ON weekly_reports;

CREATE POLICY "Owners can view weekly reports for cars they own" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND (
        -- Main owner of the car (cars.owner_id)
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = weekly_reports.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Additional car owner (car_owners table)
        EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = weekly_reports.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );

-- Update the car_owners policy to allow car owners to view other car owners for cars they own
DROP POLICY IF EXISTS "Allow authenticated users to select car ownership" ON car_owners;

CREATE POLICY "Car owners can view car ownership" ON car_owners
  FOR SELECT USING (
    -- Allow any authenticated user to view car ownership records
    auth.uid() IS NOT NULL
  );

-- Create a more specific policy for car owners to view ownership details
CREATE POLICY "Car owners can view ownership for their cars" ON car_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND (
        -- Main owner of the car (cars.owner_id)
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = car_owners.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Additional car owner (already in car_owners table)
        car_owners.owner_id = auth.uid()
      )
    )
  );
