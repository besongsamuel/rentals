-- Documentation for setting up webhooks to trigger verify-users edge function
-- This migration documents the webhook setup process for automatic user verification

-- WEBHOOK SETUP INSTRUCTIONS:
-- 
-- To set up the webhooks, you need to configure them in the Supabase Dashboard:
-- 
-- 1. Go to Database > Webhooks in your Supabase Dashboard
-- 2. Create two webhooks with the following configurations:
--
-- Webhook 1: driver_details table
-- - Table: driver_details
-- - Events: INSERT, UPDATE
-- - Type: HTTP Request
-- - URL: https://mqivlclsihkvhsdrtemg.supabase.co/functions/v1/verify-users
-- - HTTP Method: POST
-- - HTTP Headers: 
--   - Content-Type: application/json
--   - Authorization: Bearer [SERVICE_ROLE_KEY]
--
-- Webhook 2: extracted_user_data table
-- - Table: extracted_user_data
-- - Events: INSERT, UPDATE
-- - Type: HTTP Request
-- - URL: https://mqivlclsihkvhsdrtemg.supabase.co/functions/v1/verify-users
-- - HTTP Method: POST
-- - HTTP Headers:
--   - Content-Type: application/json
--   - Authorization: Bearer [SERVICE_ROLE_KEY]
--
-- The verify-users edge function will automatically:
-- 1. Compare license numbers from driver_details and extracted_user_data
-- 2. Set is_verified = true in driver_details if they match
-- 3. Log verification results for debugging

-- Add comments to document the verification process
COMMENT ON COLUMN driver_details.is_verified IS 'Automatically set to true when license number matches extracted data via verify-users webhook';
COMMENT ON COLUMN extracted_user_data.type IS 'Used by verify-users webhook to identify drivers_license data for verification';
