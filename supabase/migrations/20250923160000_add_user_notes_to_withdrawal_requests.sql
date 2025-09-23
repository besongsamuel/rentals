-- Add user_notes column to withdrawal_requests table
-- Allow users to add notes when creating withdrawal requests

ALTER TABLE withdrawal_requests 
ADD COLUMN user_notes TEXT;

-- Update the comment for the new column
COMMENT ON COLUMN withdrawal_requests.user_notes IS 'Optional notes from the user when creating the withdrawal request';

-- Update the create_withdrawal_request function to accept user notes
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
  RETURNING id, status
  INTO withdrawal_id, status;
  
  RETURN QUERY SELECT withdrawal_id, status;
END;
$$;

-- Update the comment for the updated function
COMMENT ON FUNCTION create_withdrawal_request(TEXT) IS 'Creates a withdrawal request for the authenticated user with their full balance and optional user notes';
