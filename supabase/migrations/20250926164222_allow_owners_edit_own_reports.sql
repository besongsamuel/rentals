-- Allow car owners to edit their own reports when they are the driver
-- This enables owners who drive their own cars to edit reports in draft mode

-- Drop the existing driver-only update policy
DROP POLICY IF EXISTS "Drivers can update their own reports" ON weekly_reports;

-- Create new policy that allows both drivers and owners to update their own reports
CREATE POLICY "Users can update their own reports" ON weekly_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        -- Allow drivers to update their own reports
        (p.user_type = 'driver' AND weekly_reports.driver_id = auth.uid())
        OR
        -- Allow owners to update reports where they are the driver
        (p.user_type = 'owner' AND weekly_reports.driver_id = auth.uid())
      )
    )
  );

-- Add comment to document the policy change
COMMENT ON POLICY "Users can update their own reports" ON weekly_reports IS 
'Allows both drivers and car owners to update their own weekly reports when they are the driver_id';
