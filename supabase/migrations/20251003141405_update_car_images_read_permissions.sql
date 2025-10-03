-- Update car_images table permissions to allow any authenticated user to view car images
-- This enables drivers to browse available cars and see their images

-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Drivers can view assigned car images" ON public.car_images;
DROP POLICY IF EXISTS "Admins can view all car images" ON public.car_images;

-- Create new policy allowing all authenticated users to view all car images
CREATE POLICY "Authenticated users can view all car images"
ON public.car_images FOR SELECT TO authenticated
USING (true);

-- Add comment explaining the policy
COMMENT ON POLICY "Authenticated users can view all car images" ON public.car_images IS 
'Allow any authenticated user to view car images for browsing and searching purposes';
