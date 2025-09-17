-- Update car_owners select policy to allow any authenticated user to read
-- This simplifies access control and allows all authenticated users to view car ownership data

-- Drop existing select policies on car_owners
DROP POLICY IF EXISTS "Car owners can view car ownership" ON car_owners;
DROP POLICY IF EXISTS "Car owners can view ownership for their cars" ON car_owners;

-- Create a single, simple policy that allows any authenticated user to read car_owners
CREATE POLICY "Authenticated users can view car ownership" ON car_owners
  FOR SELECT USING (
    -- Allow any authenticated user to view car ownership records
    auth.uid() IS NOT NULL
  );

-- Add comment to document the policy
COMMENT ON POLICY "Authenticated users can view car ownership" ON car_owners IS 
'Allows any authenticated user to read car ownership data for transparency and collaboration';
