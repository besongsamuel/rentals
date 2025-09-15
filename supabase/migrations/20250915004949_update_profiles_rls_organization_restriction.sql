-- Update profiles RLS policy to restrict access to same organization
-- This ensures users can only view profiles within their organization

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can select profiles" ON profiles;

-- Create new organization-restricted SELECT policy
CREATE POLICY "Users can select profiles in same organization" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Keep the existing INSERT, UPDATE, and DELETE policies as they are
-- (These are already properly restricted by user ownership)
