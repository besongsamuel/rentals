-- Migration: Allow car owners to create weekly reports for their cars (for themselves or assigned drivers)
-- This migration updates the RLS policies on weekly_reports table to allow owners to create reports

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Drivers can insert their own weekly reports" ON weekly_reports;

-- Create new insert policy that allows both drivers and car owners to create reports
CREATE POLICY "Drivers and owners can insert weekly reports" ON weekly_reports
  FOR INSERT
  WITH CHECK (
    -- Allow if the user is the driver creating the report
    (auth.uid() = driver_id)
    OR
    -- Allow if the user is the owner of the car for which the report is being created
    (
      EXISTS (
        SELECT 1 FROM profiles p
        INNER JOIN cars c ON c.owner_id = p.id
        WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND c.id = weekly_reports.car_id
      )
    )
  );

-- Update the select policy to also allow owners to view reports for their cars
DROP POLICY IF EXISTS "Drivers can view their weekly reports" ON weekly_reports;
DROP POLICY IF EXISTS "Owners can view weekly reports for cars they own" ON weekly_reports;

-- Create unified select policy
CREATE POLICY "Users can view relevant weekly reports" ON weekly_reports
  FOR SELECT
  USING (
    -- Drivers can view reports they created
    (
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.user_type = 'driver'
        AND weekly_reports.driver_id = auth.uid()
      )
    )
    OR
    -- Owners can view reports for their cars
    (
      EXISTS (
        SELECT 1 FROM profiles p
        INNER JOIN cars c ON c.owner_id = p.id
        WHERE p.id = auth.uid()
        AND p.user_type = 'owner'
        AND c.id = weekly_reports.car_id
      )
    )
  );

-- Update policy to allow owners to update reports for their cars (if they're in draft status)
DROP POLICY IF EXISTS "Drivers can update their own draft weekly reports" ON weekly_reports;

CREATE POLICY "Drivers and owners can update draft weekly reports" ON weekly_reports
  FOR UPDATE
  USING (
    status = 'draft'
    AND
    (
      -- Allow if the user is the driver who created the report
      (auth.uid() = driver_id)
      OR
      -- Allow if the user is the owner of the car
      (
        EXISTS (
          SELECT 1 FROM profiles p
          INNER JOIN cars c ON c.owner_id = p.id
          WHERE p.id = auth.uid()
          AND p.user_type = 'owner'
          AND c.id = weekly_reports.car_id
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
      -- Allow if the user is the owner of the car
      (
        EXISTS (
          SELECT 1 FROM profiles p
          INNER JOIN cars c ON c.owner_id = p.id
          WHERE p.id = auth.uid()
          AND p.user_type = 'owner'
          AND c.id = weekly_reports.car_id
        )
      )
    )
  );
