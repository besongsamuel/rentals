# Car Images Storage Migration

## Overview

This document describes the migration from the `car_images` database table to a storage-first approach using Supabase Storage buckets.

## Motivation

Moving to a storage-first approach provides several benefits:

1. **Simplified Architecture**: No need to maintain a separate database table for image metadata
2. **Better Performance**: Direct access to storage without database queries
3. **Consistency**: Similar pattern to driver license images
4. **Scalability**: Storage buckets are designed for file management
5. **Reduced Complexity**: Fewer moving parts to maintain and debug

## Migration Details

### Deprecated Components

#### Database Table

- **Table**: `car_images` (deprecated but not dropped)
- **Migration**: `20251003171632_deprecate_car_images_table.sql`
- **Status**: Table remains in database for backward compatibility but is no longer used

#### TypeScript Interface

- **Interface**: `CarImage` in `src/types/index.ts`
- **Status**: Deprecated with `@deprecated` comment, will be removed in future release

#### Service

- **Service**: `carImageService.ts`
- **Status**: Deprecated, replaced by `carImageStorageService.ts`

### New Implementation

#### Storage Service

- **File**: `src/services/carImageStorageService.ts`
- **Bucket**: `cars` (existing bucket in Supabase Storage)
- **Folder Structure**: `{car_id}/` - Each car has its own folder named after its UUID
- **File Naming**: `{car_id}/{timestamp}_{random}.{extension}`

#### Key Functions

##### `getCarImageFiles(carId: string): Promise<string[]>`

Lists all image files for a specific car.

##### `getCarImageUrls(carId: string, expiresIn?: number): Promise<string[]>`

Returns signed URLs for all images of a car. Default expiration is 1 hour.

##### `getFirstCarImageUrl(carId: string, expiresIn?: number): Promise<string | null>`

Returns the first (most recent) image URL for a car. Useful for displaying car thumbnails.

##### `getCarImageUrlsForCars(carIds: string[], expiresIn?: number): Promise<Record<string, string[]>>`

Batch operation to get image URLs for multiple cars. Returns a mapping of car IDs to their image URLs.

##### `deleteCarImageFile(filePath: string): Promise<boolean>`

Deletes a specific car image file.

##### `deleteAllCarImages(carId: string): Promise<boolean>`

Deletes all images for a car.

##### `uploadCarImageFile(carId: string, file: File): Promise<string | null>`

Uploads a single car image file.

##### `uploadCarImageFiles(carId: string, files: File[]): Promise<string[]>`

Uploads multiple car image files.

### Updated Components

All components have been updated to use the new storage service:

1. **CarSearch.tsx** - Uses `getCarImageUrlsForCars` for batch loading
2. **CarCard.tsx** - Accepts `carImageUrl` prop instead of `carImage`
3. **CarList.tsx** - Uses `getFirstCarImageUrl` for loading car thumbnails
4. **AssignedCar.tsx** - Uses `getFirstCarImageUrl` for driver's assigned car view
5. **AssignedOwnerCar.tsx** - Uses `getFirstCarImageUrl` for owner's car view
6. **CarForm.tsx** - Simplified image management using FileUpload component

## Migration Steps

### For Existing Data

Existing car images in the `car_images` table should be migrated to storage:

1. Export images from the database table
2. Upload to the `cars` bucket under the appropriate `{car_id}/` folders
3. Verify all images are accessible via storage
4. (Optional) Drop the `car_images` table in a future migration

### For New Implementations

1. Use `carImageStorageService` for all car image operations
2. Images are automatically organized by car ID in storage
3. Use signed URLs for displaying images (they expire after 1 hour by default)
4. No need to manage database entries for images

## Example Usage

### Loading Car Images

```typescript
import { carImageStorageService } from "../services/carImageStorageService";

// Get first image for a car (for thumbnails)
const imageUrl = await carImageStorageService.getFirstCarImageUrl(carId);

// Get all images for a car
const imageUrls = await carImageStorageService.getCarImageUrls(carId);

// Get images for multiple cars (batch operation)
const carImageUrls = await carImageStorageService.getCarImageUrlsForCars([
  carId1,
  carId2,
  carId3,
]);
```

### Uploading Car Images

```typescript
// Upload is handled by the FileUpload component
// The component automatically organizes files in the correct folder structure
<FileUpload
  bucket="cars"
  path={carId} // Car ID is used as the folder name
  multiple={true}
  isPublic={true}
  onUploadComplete={(urls) => {
    // URLs are automatically generated from storage
    setCarImageUrls(Array.isArray(urls) ? urls : [urls]);
  }}
/>
```

### Deleting Car Images

```typescript
// Delete a specific image
const success = await carImageStorageService.deleteCarImageFile(
  `${carId}/image.jpg`
);

// Delete all images for a car
const success = await carImageStorageService.deleteAllCarImages(carId);
```

## Benefits of the New Approach

1. **Automatic Organization**: Images are automatically organized by car ID
2. **No Database Overhead**: No need to maintain image metadata in the database
3. **Simplified Code**: Less code to maintain and debug
4. **Better Performance**: Direct storage access without database queries
5. **Consistent with Driver Licenses**: Uses the same pattern as driver license images
6. **Built-in Features**: Leverages Supabase Storage features like signed URLs and automatic expiration

## Future Improvements

1. **Image Optimization**: Add automatic image resizing and optimization
2. **Caching**: Implement caching for frequently accessed images
3. **CDN Integration**: Consider CDN integration for global distribution
4. **Cleanup**: Remove the deprecated `car_images` table after full migration

## Rollback Plan

If issues arise, the old `car_images` table and service remain available:

1. The `car_images` table is not dropped, only deprecated
2. The `carImageService.ts` file can be restored if needed
3. Components can be reverted to use the old service

## Notes

- Signed URLs expire after 1 hour by default (configurable)
- Images are stored in the `cars` bucket (not a new bucket)
- Each car has its own folder: `{car_id}/`
- File names are automatically generated with timestamps to avoid conflicts
- The migration does not automatically transfer existing data - this should be done manually or via a data migration script
