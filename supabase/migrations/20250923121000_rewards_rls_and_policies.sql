-- Rewards RLS and policies

ALTER TABLE reward_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- View own reward account (drivers)
CREATE POLICY "Drivers can view their reward account" ON reward_accounts
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'driver')
    AND user_id = auth.uid()
  );

-- View own reward account (owners)
CREATE POLICY "Owners can view their reward account" ON reward_accounts
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'owner')
    AND user_id = auth.uid()
  );

-- View own ledger (drivers)
CREATE POLICY "Drivers can view their reward ledger" ON reward_ledger
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'driver')
    AND user_id = auth.uid()
  );

-- View own ledger (owners)
CREATE POLICY "Owners can view their reward ledger" ON reward_ledger
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'owner')
    AND user_id = auth.uid()
  );

-- View own referrals (as inviter) - drivers
CREATE POLICY "Drivers can view their referrals" ON referrals
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'driver')
    AND inviter_id = auth.uid()
  );

-- View own referrals (as inviter) - owners
CREATE POLICY "Owners can view their referrals" ON referrals
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.user_type = 'owner')
    AND inviter_id = auth.uid()
  );

-- Invitees can view the accepted referral linking them
CREATE POLICY "Invitees can view accepted referral linking them" ON referrals
  FOR SELECT TO authenticated
  USING (invitee_user_id = auth.uid() AND status = 'accepted');

-- Note: No INSERT/UPDATE/DELETE policies provided; writes should be done by edge functions
-- using the service_role which bypasses RLS.


