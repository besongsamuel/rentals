-- Add is_verified column to cars table
ALTER TABLE cars
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment to describe the column
COMMENT ON COLUMN cars.is_verified IS 'Flag indicating whether the car has been verified by admin';

-- Create an index for faster filtering by verification status
CREATE INDEX idx_cars_is_verified ON cars(is_verified);

-- Add is_verified column to driver_details table
ALTER TABLE driver_details
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment to describe the column
COMMENT ON COLUMN driver_details.is_verified IS 'Flag indicating whether the driver has been verified by admin';

-- Create an index for faster filtering by verification status
CREATE INDEX idx_driver_details_is_verified ON driver_details(is_verified);

