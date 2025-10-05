-- Remove email notification triggers and functions
-- Email notifications are now handled by Supabase Database Webhooks configured in the Dashboard

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_notify_drive_request ON car_assignment_requests;
DROP TRIGGER IF EXISTS trigger_notify_weekly_report_submitted ON weekly_reports;

-- Drop functions
DROP FUNCTION IF EXISTS notify_drive_request();
DROP FUNCTION IF EXISTS notify_weekly_report_submitted();

-- Add comment for documentation
COMMENT ON TABLE car_assignment_requests IS 
  'Car assignment requests table. Email notifications are handled by Database Webhooks configured in Supabase Dashboard.';

COMMENT ON TABLE weekly_reports IS 
  'Weekly reports table. Email notifications for submitted reports are handled by Database Webhooks configured in Supabase Dashboard.';
