-- Create a function to call the send-email edge function for drive requests
CREATE OR REPLACE FUNCTION notify_drive_request()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get the Edge Function URL from environment or construct it
  -- Format: https://<project-ref>.supabase.co/functions/v1/send-email
  function_url := current_setting('app.settings.edge_function_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Only send email for new pending requests
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Call the edge function asynchronously using pg_net extension
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'drive_request',
          'record', to_jsonb(NEW)
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for drive requests
DROP TRIGGER IF EXISTS trigger_notify_drive_request ON car_assignment_requests;
CREATE TRIGGER trigger_notify_drive_request
  AFTER INSERT ON car_assignment_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_drive_request();

-- Create a function to call the send-email edge function for weekly reports
CREATE OR REPLACE FUNCTION notify_weekly_report_submitted()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get the Edge Function URL from environment or construct it
  function_url := current_setting('app.settings.edge_function_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Only send email when status changes to 'submitted'
  IF TG_OP = 'UPDATE' 
     AND OLD.status IS DISTINCT FROM NEW.status 
     AND NEW.status = 'submitted' THEN
    -- Call the edge function asynchronously using pg_net extension
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'weekly_report_submitted',
          'record', to_jsonb(NEW)
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for weekly reports
DROP TRIGGER IF EXISTS trigger_notify_weekly_report_submitted ON weekly_reports;
CREATE TRIGGER trigger_notify_weekly_report_submitted
  AFTER UPDATE ON weekly_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_weekly_report_submitted();

-- Add comments for documentation
COMMENT ON FUNCTION notify_drive_request() IS 
  'Sends email notification to car owner when a new drive request is created';

COMMENT ON FUNCTION notify_weekly_report_submitted() IS 
  'Sends email notification to car owner when a weekly report is submitted';

COMMENT ON TRIGGER trigger_notify_drive_request ON car_assignment_requests IS 
  'Triggers email notification for new drive requests';

COMMENT ON TRIGGER trigger_notify_weekly_report_submitted ON weekly_reports IS 
  'Triggers email notification when weekly report status changes to submitted';
