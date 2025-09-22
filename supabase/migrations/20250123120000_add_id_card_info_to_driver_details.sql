-- Add ID card information columns to driver_details table
-- This migration adds optional ID card fields for driver verification

-- Add ID card information columns
ALTER TABLE driver_details 
ADD COLUMN id_card_type TEXT,
ADD COLUMN id_card_number TEXT,
ADD COLUMN id_card_expiry_date DATE;

-- Add constraints for ID card type
ALTER TABLE driver_details 
ADD CONSTRAINT check_id_card_type 
CHECK (id_card_type IS NULL OR id_card_type IN (
  'passport', 
  'national_id', 
  'residency_card', 
  'drivers_license', 
  'military_id', 
  'student_id', 
  'other'
));

-- Add comments to document the new columns
COMMENT ON COLUMN driver_details.id_card_type IS 'Type of ID card (passport, national_id, residency_card, etc.) - optional';
COMMENT ON COLUMN driver_details.id_card_number IS 'ID card number - optional';
COMMENT ON COLUMN driver_details.id_card_expiry_date IS 'ID card expiry date - optional';

-- Create index for ID card expiry date for easy querying of expired cards
CREATE INDEX idx_driver_details_id_card_expiry_date ON driver_details(id_card_expiry_date);

-- Update the database schema documentation
-- The driver_details table now includes additional ID card information:
-- - id_card_type: TEXT (optional) - Type of ID card
-- - id_card_number: TEXT (optional) - ID card number  
-- - id_card_expiry_date: DATE (optional) - ID card expiry date
