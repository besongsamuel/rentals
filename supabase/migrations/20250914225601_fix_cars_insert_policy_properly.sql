-- Fix cars table INSERT policy to properly allow car creation
-- The issue is that the current policy is too restrictive and doesn't account for the actual table structure

-- First, let's check what the current cars table structure actually is
-- and then create appropriate policies

-- Drop existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Authenticated users can insert cars" ON cars;

-- Create a more permissive INSERT policy for cars
-- This allows any authenticated user to insert a car
-- The ownership relationship will be handled separately through car_owners table
CREATE POLICY "Authenticated users can insert cars" ON cars
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also ensure we have proper SELECT policies for cars
-- Users should be able to see cars they own or are assigned to drive
DROP POLICY IF EXISTS "Users can view their cars" ON cars;

CREATE POLICY "Users can view their cars" ON cars
  FOR SELECT USING (
    -- User can see cars they own (through car_owners table)
    EXISTS (
      SELECT 1 FROM car_owners co 
      WHERE co.car_id = cars.id 
      AND co.owner_id = auth.uid()
    )
    OR
    -- User can see cars they are assigned to drive
    driver_id = auth.uid()
    OR
    -- For now, let's also allow owners to see all cars for management purposes
    -- This can be refined later based on business requirements
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.user_type = 'owner'
    )
  );

-- Ensure we have UPDATE policies for cars
DROP POLICY IF EXISTS "Users can update their cars" ON cars;

CREATE POLICY "Users can update their cars" ON cars
  FOR UPDATE USING (
    -- Owners can update cars they own
    EXISTS (
      SELECT 1 FROM car_owners co 
      WHERE co.car_id = cars.id 
      AND co.owner_id = auth.uid()
    )
    OR
    -- Drivers can update cars they are assigned to (for mileage updates, etc.)
    driver_id = auth.uid()
  );

-- Ensure we have DELETE policies for cars
DROP POLICY IF EXISTS "Users can delete their cars" ON cars;

CREATE POLICY "Users can delete their cars" ON cars
  FOR DELETE USING (
    -- Only owners can delete cars
    EXISTS (
      SELECT 1 FROM car_owners co 
      WHERE co.car_id = cars.id 
      AND co.owner_id = auth.uid()
    )
  );
