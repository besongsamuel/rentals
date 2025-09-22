-- Add referred_by column to profiles table
-- This column stores the name of the person who referred the user to the platform

-- Add the referred_by column
ALTER TABLE profiles 
ADD COLUMN referred_by TEXT;

-- Add a comment to document the column purpose
COMMENT ON COLUMN profiles.referred_by IS 'Name of the person who referred this user to the platform (optional)';

-- Update the database schema documentation
-- The profiles table now includes:
-- - id: UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
-- - email: TEXT NOT NULL
-- - full_name: TEXT
-- - user_type: TEXT NOT NULL CHECK (user_type IN ('driver', 'owner'))
-- - phone: TEXT
-- - country: TEXT
-- - referred_by: TEXT (NEW - optional referral information)
-- - created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- - updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
