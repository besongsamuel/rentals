-- Create storage buckets
-- Reference: https://supabase.com/docs/guides/storage

-- Create driver_licenses bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'driver_licenses',
  'driver_licenses',
  false, -- Private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create cars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cars',
  'cars',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS Policies for driver_licenses bucket
-- ============================================

-- Policy: Drivers can upload to their own folder
-- Folder name format: {driver_id}/filename.ext
CREATE POLICY "Drivers can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'driver_licenses' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'driver'
  )
);

-- Policy: Drivers can read files from their own folder
CREATE POLICY "Drivers can read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver_licenses'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'driver'
  )
);

-- Policy: Drivers can update files in their own folder
CREATE POLICY "Drivers can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'driver_licenses'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'driver'
  )
)
WITH CHECK (
  bucket_id = 'driver_licenses'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Drivers can delete files from their own folder
CREATE POLICY "Drivers can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver_licenses'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND user_type = 'driver'
  )
);

-- Policy: Admins can read all driver license files
CREATE POLICY "Admins can read all driver license files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver_licenses'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- ============================================
-- RLS Policies for cars bucket (public)
-- ============================================

-- Policy: Car owners can upload to their car folders
-- Folder name format: {car_id}/filename.ext
CREATE POLICY "Car owners can upload to their car folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cars'
  AND EXISTS (
    SELECT 1 FROM cars
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

-- Policy: Anyone can read from cars bucket (public)
CREATE POLICY "Anyone can read car images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'cars');

-- Policy: Car owners can update files in their car folders
CREATE POLICY "Car owners can update their car files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cars'
  AND EXISTS (
    SELECT 1 FROM cars
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'cars'
  AND EXISTS (
    SELECT 1 FROM cars
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);

-- Policy: Car owners can delete files from their car folders
CREATE POLICY "Car owners can delete their car files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cars'
  AND EXISTS (
    SELECT 1 FROM cars
    WHERE id::text = (storage.foldername(name))[1]
    AND owner_id = auth.uid()
  )
);


