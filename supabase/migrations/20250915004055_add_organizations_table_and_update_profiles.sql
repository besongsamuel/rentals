-- Add organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
CREATE POLICY "Authenticated users can view all organizations" ON organizations
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert organizations" ON organizations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update organizations" ON organizations
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete organizations" ON organizations
  FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Insert the default organization "mo kumbi"
INSERT INTO organizations (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'mo kumbi', 'Professional car fleet management and rental service company');

-- Add organization_id column to profiles table with default value
ALTER TABLE profiles 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Set default value for existing profiles to the seeded organization
UPDATE profiles 
SET organization_id = '550e8400-e29b-41d4-a716-446655440000' 
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL with default value for future inserts
ALTER TABLE profiles 
ALTER COLUMN organization_id SET DEFAULT '550e8400-e29b-41d4-a716-446655440000',
ALTER COLUMN organization_id SET NOT NULL;

-- Create index on organization_id for better performance
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
