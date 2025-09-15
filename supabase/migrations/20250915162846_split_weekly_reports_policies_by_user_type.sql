-- Split weekly_reports SELECT policy into separate policies for drivers and owners
-- This follows the new rule of creating separate policies by user type

-- Drop the existing generic policy
DROP POLICY IF EXISTS "Users can view relevant weekly reports" ON weekly_reports;

-- Create separate policy for drivers
CREATE POLICY "Drivers can view their weekly reports" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND weekly_reports.driver_id = auth.uid()
    )
  );

-- Create separate policy for owners
CREATE POLICY "Owners can view weekly reports for cars they own" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND EXISTS (
        SELECT 1 FROM cars c
        WHERE c.id = weekly_reports.car_id
        AND c.owner_id = auth.uid()
      )
    )
  );
