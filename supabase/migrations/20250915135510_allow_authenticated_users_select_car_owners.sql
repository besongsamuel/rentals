-- Allow any authenticated user to select from car_owners table
-- This removes organization restrictions and allows all authenticated users to view car ownership

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view car ownership in their organization" ON car_owners;

-- Create a new SELECT policy that allows any authenticated user to view car ownership
CREATE POLICY "Allow authenticated users to select car ownership" ON car_owners
  FOR SELECT USING (
    -- Allow any authenticated user to view car ownership records
    auth.uid() IS NOT NULL
  );
