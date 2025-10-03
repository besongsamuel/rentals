-- Deprecate license_image_url field in driver_details table
-- Moving to a storage-first approach where images are fetched directly from
-- the driver_licenses bucket using the user's profile_id

-- Add comment to document deprecation strategy
COMMENT ON COLUMN driver_details.license_image_url IS 
  'DEPRECATED: This field is no longer used for preview. Images are now fetched directly from the driver_licenses storage bucket using profile_id. This field may be removed in a future migration.';

-- Note: We are not dropping the column yet to maintain backward compatibility
-- and to allow for gradual migration. The column will be set to NULL when
-- images are deleted, but images are always fetched from storage for preview.
