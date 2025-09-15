-- Drop income_sources table and add income columns to weekly_reports
-- This migration consolidates income tracking directly into weekly_reports

-- First, drop the income_sources table (this will also drop any foreign key constraints)
DROP TABLE IF EXISTS income_sources CASCADE;

-- Add new income columns to weekly_reports table
ALTER TABLE weekly_reports 
ADD COLUMN IF NOT EXISTS ride_share_income DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS rental_income DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'XAF';

-- Add comments for documentation
COMMENT ON COLUMN weekly_reports.ride_share_income IS 'Income from ride sharing services (Uber, Bolt, etc.)';
COMMENT ON COLUMN weekly_reports.rental_income IS 'Income from car rental services';
COMMENT ON COLUMN weekly_reports.currency IS 'Currency code for income amounts (default: XAF)';

-- Create indexes for the new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_weekly_reports_ride_share_income ON weekly_reports(ride_share_income);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_rental_income ON weekly_reports(rental_income);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_currency ON weekly_reports(currency);
