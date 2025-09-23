-- Add admin policies for reward_accounts table
-- Allow admin users to have full read/write access to reward_accounts

-- Admin can view all reward accounts
CREATE POLICY "Admins can view all reward accounts" ON reward_accounts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Admin can insert reward accounts
CREATE POLICY "Admins can insert reward accounts" ON reward_accounts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );

-- Admin can update reward accounts
CREATE POLICY "Admins can update reward accounts" ON reward_accounts
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

-- Admin can delete reward accounts
CREATE POLICY "Admins can delete reward accounts" ON reward_accounts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.is_admin = true
    )
  );
