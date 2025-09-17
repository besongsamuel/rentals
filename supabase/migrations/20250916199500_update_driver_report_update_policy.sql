-- Update weekly_reports policy to allow drivers to update their reports regardless of status
-- Previously drivers could only update draft reports, now they can update any status

-- Drop the existing policy that restricts updates to draft status only
DROP POLICY IF EXISTS "Drivers can update their own draft reports" ON weekly_reports;

-- Create new policy that allows drivers to update their reports regardless of status
CREATE POLICY "Drivers can update their own reports" ON weekly_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND weekly_reports.driver_id = auth.uid()
    )
  );

-- Add comment to document the policy change
COMMENT ON POLICY "Drivers can update their own reports" ON weekly_reports IS 
'Allows drivers to update their own weekly reports regardless of status (draft, submitted, approved, rejected)';
