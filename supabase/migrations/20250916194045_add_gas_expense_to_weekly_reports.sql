-- Add gas_expense column to weekly_reports table
-- This migration adds a new column to track gas expenses for each weekly report

-- Add gas_expense column to weekly_reports table
ALTER TABLE weekly_reports 
ADD COLUMN IF NOT EXISTS gas_expense DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN weekly_reports.gas_expense IS 'Gas/fuel expenses for the week in the specified currency';

-- Create index for the new column for better query performance
CREATE INDEX IF NOT EXISTS idx_weekly_reports_gas_expense ON weekly_reports(gas_expense);
