-- Add is_test column to profiles table
-- This column indicates if the user is a test user (default: false)

ALTER TABLE profiles 
ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT false;

-- Add comment to the column for documentation
COMMENT ON COLUMN profiles.is_test IS 'Indicates if the user is a test user';
