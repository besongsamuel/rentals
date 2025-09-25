-- Fix ambiguous column reference in create_withdrawal_request functions
-- The issue was that 'status' could refer to either a PL/pgSQL variable or table column

-- Fix the original create_withdrawal_request function
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
    AND status IN ('pending', 'processing')
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

-- Fix the create_withdrawal_request function with user notes
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
    AND status IN ('pending', 'processing')
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

-- Update function comments
COMMENT ON FUNCTION create_withdrawal_request() IS 'Creates a withdrawal request for the authenticated user with their full balance';
COMMENT ON FUNCTION create_withdrawal_request(TEXT) IS 'Creates a withdrawal request for the authenticated user with their full balance and optional user notes';
