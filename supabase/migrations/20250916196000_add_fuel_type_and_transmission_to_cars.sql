-- Add fuel_type and transmission_type columns to cars table
-- This migration adds fuel type and transmission type fields to improve car specifications

-- Add fuel_type column to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric'));

-- Add transmission_type column to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS transmission_type TEXT CHECK (transmission_type IN ('manual', 'automatic'));

-- Add comments for documentation
COMMENT ON COLUMN cars.fuel_type IS 'Type of fuel the vehicle uses (gasoline, diesel, hybrid, electric)';
COMMENT ON COLUMN cars.transmission_type IS 'Type of transmission (manual, automatic)';

-- Create indexes for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_transmission_type ON cars(transmission_type);

-- Update existing cars with default values (optional - can be updated later through the UI)
-- Set default fuel_type to 'gasoline' for existing cars
UPDATE cars 
SET fuel_type = 'gasoline' 
WHERE fuel_type IS NULL;

-- Set default transmission_type to 'automatic' for existing cars
UPDATE cars 
SET transmission_type = 'automatic' 
WHERE transmission_type IS NULL;
