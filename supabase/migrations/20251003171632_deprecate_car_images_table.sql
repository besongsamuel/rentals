-- Deprecate car_images table in favor of storage-first approach
-- Moving to a storage-first approach where images are fetched directly from
-- the cars bucket using the car's id as the folder name

-- Add comment to document deprecation strategy
COMMENT ON TABLE public.car_images IS 
  'DEPRECATED: This table is no longer used for car image management. Images are now 
   fetched directly from the cars storage bucket using car_id as the folder name. 
   This table may be removed in a future migration.';

-- Note: We are not dropping the table yet to maintain backward compatibility
-- and to allow for gradual migration. The table will be kept for now but
-- all new image operations should use the cars storage bucket.
