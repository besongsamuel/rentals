-- Migration: Update weekly reports RLS policies with simplified owner check
-- This migration updates the INSERT and SELECT policies to use a simpler query for owner validation

-- Drop existing insert policy
DROP POLICY IF EXISTS "Drivers and owners can insert weekly reports" ON weekly_reports;

-- Create new insert policy with simplified owner check
CREATE POLICY "Drivers and owners can insert weekly reports" ON weekly_reports
  FOR INSERT
  WITH CHECK (
    -- Allow if the user is the driver creating the report
    (auth.uid() = driver_id)
    OR
    -- Allow if the user is the owner of the car (simplified check)
    (
      EXISTS (
        SELECT 1 FROM cars c 
        WHERE c.id = car_id 
        AND c.owner_id = auth.uid()
      )
    )
  );

-- Drop existing select policy
DROP POLICY IF EXISTS "Users can view relevant weekly reports" ON weekly_reports;

-- Create updated select policy with simplified owner check
CREATE POLICY "Users can view relevant weekly reports" ON weekly_reports
  FOR SELECT
  USING (
    -- Drivers can view reports they created
    (auth.uid() = driver_id)
    OR
    -- Owners can view reports for their cars (simplified check)
    (
      EXISTS (
        SELECT 1 FROM cars c 
        WHERE c.id = weekly_reports.car_id 
        AND c.owner_id = auth.uid()
      )
    )
  );

-- Drop existing update policy
DROP POLICY IF EXISTS "Drivers and owners can update draft weekly reports" ON weekly_reports;

-- Create updated update policy with simplified owner check
CREATE POLICY "Drivers and owners can update draft weekly reports" ON weekly_reports
  FOR UPDATE
  USING (
    status = 'draft'
    AND
    (
      -- Allow if the user is the driver who created the report
      (auth.uid() = driver_id)
      OR
      -- Allow if the user is the owner of the car (simplified check)
      (
        EXISTS (
          SELECT 1 FROM cars c 
          WHERE c.id = car_id 
          AND c.owner_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    status = 'draft'
    AND
    (
      -- Allow if the user is the driver who created the report
      (auth.uid() = driver_id)
      OR
      -- Allow if the user is the owner of the car (simplified check)
      (
        EXISTS (
          SELECT 1 FROM cars c 
          WHERE c.id = car_id 
          AND c.owner_id = auth.uid()
        )
      )
    )
  );
