-- Add taxi_income column and remove total_earnings from weekly_reports table
-- total_earnings can be calculated from income sources and expenses

-- Add taxi_income column
ALTER TABLE weekly_reports 
ADD COLUMN taxi_income DECIMAL(10,2) DEFAULT 0.00;

-- Add comment to explain the column
COMMENT ON COLUMN weekly_reports.taxi_income IS 'Income from taxi/ride-sharing services';

-- Remove total_earnings column as it can be calculated from income sources and expenses
ALTER TABLE weekly_reports 
DROP COLUMN IF EXISTS total_earnings;

-- Update any existing records to set taxi_income to 0 if it's NULL
UPDATE weekly_reports 
SET taxi_income = 0.00 
WHERE taxi_income IS NULL;

-- Add constraint to ensure taxi_income is not negative
ALTER TABLE weekly_reports 
ADD CONSTRAINT check_taxi_income_non_negative 
CHECK (taxi_income >= 0);

-- Note: total_earnings can now be calculated as:
-- (ride_share_income + rental_income + taxi_income + other_income) - (gas_expense + maintenance_expense + other_expenses)
