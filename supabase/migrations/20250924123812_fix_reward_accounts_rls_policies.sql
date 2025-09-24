-- Fix reward accounts RLS policies to allow all authenticated users to view their own accounts
-- The previous policies were too restrictive and required specific user_type

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Drivers can view their reward account" ON reward_accounts;
DROP POLICY IF EXISTS "Owners can view their reward account" ON reward_accounts;

-- Create a more permissive policy that allows any authenticated user to view their own reward account
CREATE POLICY "Authenticated users can view their own reward account" ON reward_accounts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Drop existing restrictive ledger policies
DROP POLICY IF EXISTS "Drivers can view their reward ledger" ON reward_ledger;
DROP POLICY IF EXISTS "Owners can view their reward ledger" ON reward_ledger;

-- Create a more permissive policy for reward ledger
CREATE POLICY "Authenticated users can view their own reward ledger" ON reward_ledger
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Drop existing restrictive referral policies
DROP POLICY IF EXISTS "Drivers can view their referrals" ON referrals;
DROP POLICY IF EXISTS "Owners can view their referrals" ON referrals;

-- Create a more permissive policy for referrals
CREATE POLICY "Authenticated users can view their own referrals" ON referrals
  FOR SELECT TO authenticated
  USING (inviter_id = auth.uid() OR invitee_user_id = auth.uid());

-- Ensure all users have reward accounts created automatically
-- This function will be called when users first access the rewards section
CREATE OR REPLACE FUNCTION create_user_reward_account_if_not_exists()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create reward account for current user if it doesn't exist
  PERFORM ensure_reward_account(auth.uid(), 'CAD');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_reward_account_if_not_exists() TO authenticated;
