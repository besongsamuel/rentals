-- Add country column to profiles table
ALTER TABLE profiles ADD COLUMN country VARCHAR(2) DEFAULT 'CM';

-- Add comment to describe the column
COMMENT ON COLUMN profiles.country IS 'Country code (ISO 3166-1 alpha-2) for the user';

-- Create index for better query performance
CREATE INDEX idx_profiles_country ON profiles(country);

-- Update existing profiles to have Cameroon as default country
UPDATE profiles SET country = 'CM' WHERE country IS NULL;
