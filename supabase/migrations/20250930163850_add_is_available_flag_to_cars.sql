-- Migration: Add is_available flag to cars table and update RLS policies
-- This migration adds a new boolean column to indicate if a car is publicly available
-- and updates the SELECT policy to allow authenticated users to view available cars

-- Add is_available column to cars table with default value true
ALTER TABLE cars
ADD COLUMN is_available BOOLEAN NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN cars.is_available IS 'When true, the car is publicly visible to all authenticated users';

-- Drop existing SELECT policy for cars
DROP POLICY IF EXISTS "Owners can view their own cars" ON cars;
DROP POLICY IF EXISTS "Drivers can view cars assigned to them" ON cars;
DROP POLICY IF EXISTS "Users can view relevant cars" ON cars;

-- Create new unified SELECT policy that allows:
-- 1. Owners to view their own cars
-- 2. Drivers to view cars assigned to them
-- 3. All authenticated users to view available cars
CREATE POLICY "Users can view cars based on ownership, assignment, or availability" ON cars
  FOR SELECT
  USING (
    -- Owner can view their own cars
    (owner_id = auth.uid())
    OR
    -- Driver can view cars assigned to them
    (driver_id = auth.uid())
    OR
    -- Any authenticated user can view available cars
    (is_available = true AND auth.uid() IS NOT NULL)
  );
