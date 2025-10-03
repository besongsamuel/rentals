-- Add image_url column to cars table
ALTER TABLE cars
ADD COLUMN image_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN cars.image_url IS 'Optional URL for car image';

-- Create an index for faster lookups (optional, but good practice)
CREATE INDEX IF NOT EXISTS idx_cars_image_url ON cars(image_url) WHERE image_url IS NOT NULL;

