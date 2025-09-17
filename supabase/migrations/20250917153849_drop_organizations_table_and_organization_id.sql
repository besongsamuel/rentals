-- Drop organization_id column from profiles table
-- First, drop the foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;

-- Drop the index on organization_id
DROP INDEX IF EXISTS idx_profiles_organization_id;

-- Drop the organization_id column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS organization_id;

-- Drop all RLS policies on organizations table
DROP POLICY IF EXISTS "Authenticated users can view all organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can insert organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can update organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can delete organizations" ON organizations;

-- Drop the organizations table
DROP TABLE IF EXISTS organizations;
