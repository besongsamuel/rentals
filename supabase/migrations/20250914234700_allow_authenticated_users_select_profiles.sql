-- Allow any authenticated user to select from profiles table
-- This is needed for driver/owner assignment dropdowns to work properly

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policy allowing any authenticated user to select any profile
CREATE POLICY "Authenticated users can select all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);
