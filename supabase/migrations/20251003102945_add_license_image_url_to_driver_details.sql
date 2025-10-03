-- Add license_image_url column to driver_details table
ALTER TABLE driver_details
ADD COLUMN license_image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN driver_details.license_image_url IS 'Optional URL for driver license image - required for verification';

-- Create an index for faster lookups when license image is present
CREATE INDEX IF NOT EXISTS idx_driver_details_license_image_url ON driver_details(license_image_url) WHERE license_image_url IS NOT NULL;

