-- Fix all ambiguous column references in withdrawal request functions
-- This migration drops and recreates all withdrawal-related functions to ensure
-- no ambiguous column references remain

-- Drop all existing withdrawal functions
DROP FUNCTION IF EXISTS create_withdrawal_request();
DROP FUNCTION IF EXISTS create_withdrawal_request(TEXT);
DROP FUNCTION IF EXISTS process_withdrawal_request(UUID, TEXT, TEXT);

-- Recreate create_withdrawal_request() function without user notes
CREATE OR REPLACE FUNCTION create_withdrawal_request()
RETURNS TABLE(
  withdrawal_id UUID,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_balance INTEGER;
  withdrawal_id UUID;
  request_status TEXT;
BEGIN
  -- Get user's current balance
  SELECT balance_cents 
  INTO user_balance
  FROM reward_accounts 
  WHERE user_id = auth.uid();
  
  -- Check if user has a reward account and sufficient balance
  IF user_balance IS NULL THEN
    RAISE EXCEPTION 'No reward account found for user';
  END IF;
  
  IF user_balance <= 0 THEN
    RAISE EXCEPTION 'Insufficient balance for withdrawal';
  END IF;
  
  -- Check if user has any pending withdrawal requests
  IF EXISTS (
    SELECT 1 FROM withdrawal_requests 
    WHERE user_id = auth.uid() 
    AND withdrawal_requests.status IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'You already have a pending withdrawal request';
  END IF;
  
  -- Create withdrawal request
  INSERT INTO withdrawal_requests (user_id)
  VALUES (auth.uid())
  RETURNING id, withdrawal_requests.status
  INTO withdrawal_id, request_status;
  
  RETURN QUERY SELECT withdrawal_id, request_status;
END;
$$;

-- Recreate create_withdrawal_request(TEXT) function with user notes
CREATE OR REPLACE FUNCTION create_withdrawal_request(
  p_user_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  withdrawal_id UUID,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_balance INTEGER;
  withdrawal_id UUID;
  request_status TEXT;
BEGIN
  -- Get user's current balance
  SELECT balance_cents 
  INTO user_balance
  FROM reward_accounts 
  WHERE user_id = auth.uid();
  
  -- Check if user has a reward account and sufficient balance
  IF user_balance IS NULL THEN
    RAISE EXCEPTION 'No reward account found for user';
  END IF;
  
  IF user_balance <= 0 THEN
    RAISE EXCEPTION 'Insufficient balance for withdrawal';
  END IF;
  
  -- Check if user has any pending withdrawal requests
  IF EXISTS (
    SELECT 1 FROM withdrawal_requests 
    WHERE user_id = auth.uid() 
    AND withdrawal_requests.status IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'You already have a pending withdrawal request';
  END IF;
  
  -- Create withdrawal request with optional user notes
  INSERT INTO withdrawal_requests (user_id, user_notes)
  VALUES (auth.uid(), p_user_notes)
  RETURNING id, withdrawal_requests.status
  INTO withdrawal_id, request_status;
  
  RETURN QUERY SELECT withdrawal_id, request_status;
END;
$$;

-- Recreate process_withdrawal_request function for admins
CREATE OR REPLACE FUNCTION process_withdrawal_request(
  p_withdrawal_id UUID,
  p_new_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS TABLE(
  withdrawal_id UUID,
  status TEXT,
  user_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  request_user_id UUID;
  result_withdrawal_id UUID;
  result_status TEXT;
  result_user_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Validate status
  IF p_new_status NOT IN ('processing', 'completed', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;
  
  -- Get current withdrawal request details
  SELECT withdrawal_requests.status, withdrawal_requests.user_id
  INTO current_status, request_user_id
  FROM withdrawal_requests
  WHERE id = p_withdrawal_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Withdrawal request not found';
  END IF;
  
  -- Update withdrawal request
  UPDATE withdrawal_requests
  SET 
    status = p_new_status,
    processed_at = CASE 
      WHEN p_new_status IN ('completed', 'rejected', 'cancelled') THEN NOW()
      ELSE processed_at
    END,
    rejection_reason = CASE 
      WHEN p_new_status = 'rejected' THEN p_rejection_reason
      ELSE rejection_reason
    END,
    updated_at = NOW()
  WHERE id = p_withdrawal_id
  RETURNING id, withdrawal_requests.status, withdrawal_requests.user_id
  INTO result_withdrawal_id, result_status, result_user_id;
  
  RETURN QUERY SELECT result_withdrawal_id, result_status, result_user_id;
END;
$$;

-- Add function comments
COMMENT ON FUNCTION create_withdrawal_request() IS 'Creates a withdrawal request for the authenticated user with their full balance';
COMMENT ON FUNCTION create_withdrawal_request(TEXT) IS 'Creates a withdrawal request for the authenticated user with their full balance and optional user notes';
COMMENT ON FUNCTION process_withdrawal_request(UUID, TEXT, TEXT) IS 'Allows admins to process withdrawal requests by updating their status';
