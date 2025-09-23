-- Create withdrawal_requests table to track user withdrawal requests
-- Users can request withdrawal of their full reward balance

CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT, -- Reason for rejection if status is 'rejected'
  admin_notes TEXT -- Admin notes for internal tracking
);

-- Create indexes for better performance
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_created_at ON withdrawal_requests(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_withdrawal_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_withdrawal_requests_updated_at();

-- Enable RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawal requests
CREATE POLICY "Users can view their own withdrawal requests" ON withdrawal_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can create withdrawal requests for themselves
CREATE POLICY "Users can create withdrawal requests" ON withdrawal_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND status = 'pending'
  );

-- Users can cancel their own pending withdrawal requests
CREATE POLICY "Users can cancel their pending withdrawal requests" ON withdrawal_requests
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid() 
    AND status = 'pending'
  )
  WITH CHECK (
    user_id = auth.uid() 
    AND status = 'cancelled'
  );

-- Admins can view all withdrawal requests
CREATE POLICY "Admins can view all withdrawal requests" ON withdrawal_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Admins can update withdrawal requests (process them)
CREATE POLICY "Admins can update withdrawal requests" ON withdrawal_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Admins can delete withdrawal requests
CREATE POLICY "Admins can delete withdrawal requests" ON withdrawal_requests
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Function to create a withdrawal request (withdraws full balance)
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
  RETURNING id, status
  INTO withdrawal_id, status;
  
  RETURN QUERY SELECT withdrawal_id, status;
END;
$$;

-- Function for admins to process withdrawal requests
CREATE OR REPLACE FUNCTION process_withdrawal_request(
  p_withdrawal_id UUID,
  p_new_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_status TEXT;
  request_user_id UUID;
BEGIN
  -- Verify admin status
  IF NOT EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Validate status
  IF p_new_status NOT IN ('processing', 'completed', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;
  
  -- Get current withdrawal request details
  SELECT status, user_id
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
    admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE id = p_withdrawal_id;
  
  -- If completed, reset user's reward account balance to zero
  IF p_new_status = 'completed' THEN
    UPDATE reward_accounts
    SET balance_cents = 0
    WHERE user_id = request_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add comments for documentation
COMMENT ON TABLE withdrawal_requests IS 'Tracks user withdrawal requests for reward balances - always withdraws full balance';
COMMENT ON COLUMN withdrawal_requests.status IS 'Status of the withdrawal request: pending, processing, completed, rejected, cancelled';
COMMENT ON COLUMN withdrawal_requests.rejection_reason IS 'Reason for rejection if status is rejected';
COMMENT ON COLUMN withdrawal_requests.admin_notes IS 'Admin notes for internal tracking and processing';
COMMENT ON FUNCTION create_withdrawal_request() IS 'Creates a withdrawal request for the authenticated user with their full balance';
COMMENT ON FUNCTION process_withdrawal_request(UUID, TEXT, TEXT, TEXT) IS 'Admin function to process withdrawal requests - resets balance to zero when completed';
