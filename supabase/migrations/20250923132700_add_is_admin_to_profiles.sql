-- Add is_admin column to profiles with default false
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.is_admin IS 'Indicates if the user is a platform administrator';



