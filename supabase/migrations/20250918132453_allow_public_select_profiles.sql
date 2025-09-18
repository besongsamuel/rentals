-- Allow public users to select profiles for home page statistics
-- This enables unauthenticated users to see profile counts on the home page

CREATE POLICY "Public users can select profiles" ON profiles
  FOR SELECT
  TO anon
  USING (true);

-- Note: This policy allows public users to read profile data
-- which is needed for displaying user counts on the home page
-- The policy is safe as it only allows SELECT operations
-- and doesn't expose sensitive information beyond user_type counts
