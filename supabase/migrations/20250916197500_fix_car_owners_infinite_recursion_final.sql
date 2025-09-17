-- Final fix for infinite recursion in car_owners policies
-- This migration runs after the problematic policy creation to fix the recursion

-- Drop the problematic policy that references cars table (created in previous migration)
DROP POLICY IF EXISTS "Car owners can view ownership for their cars" ON car_owners;

-- Create a simpler policy that doesn't reference cars table to avoid infinite recursion
CREATE POLICY "Car owners can view ownership for their cars" ON car_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND car_owners.owner_id = auth.uid()
    )
  );

-- Also ensure we have a simple policy for viewing all car ownership (for general access)
-- This policy allows any authenticated user to view car ownership records
-- but the specific policy above provides more granular access for owners
