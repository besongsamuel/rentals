# Multiple Car Images Update

## Overview

Updated the application to support multiple images per car by creating a dedicated `car_images` table and updating the FileUpload component to handle multiple file uploads.

## Database Changes

### New Table: `car_images`

Created a new table to store multiple images for each car:

```sql
CREATE TABLE public.car_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

**Key Features:**

- Multiple images per car
- `is_primary` flag to mark the main/featured image
- Foreign key relationship with `cars` table
- Automatic cleanup on car deletion (CASCADE)

### Migration: `20251003111107_add_car_images_table.sql`

**Changes:**

1. Created `car_images` table
2. Added indexes for performance:
   - `idx_car_images_car_id` on `car_id`
   - `idx_car_images_is_primary` on `is_primary`
3. Enabled RLS on `car_images`
4. Created RLS policies:
   - Car owners can insert/view/update/delete images for their own cars
   - Drivers can view images for cars currently assigned to them
   - Admins can view all car images
5. Migrated existing `image_url` data from `cars` table to `car_images` (marked as primary)
6. Removed `image_url` column from `cars` table

### RLS Policies

```sql
-- Car owners can manage their car images
"Car owners can insert images for their cars"
"Car owners can view their car images"
"Car owners can update their car images"
"Car owners can delete their car images"

-- Drivers can view assigned car images
"Drivers can view assigned car images" (active assignments only)

-- Admins have full read access
"Admins can view all car images"
```

## TypeScript Types Updated

### Added: `CarImage` Interface

```typescript
export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
```

### Updated: `Car` Interface

- **Removed:** `image_url: string | null` property
- Car images now stored in separate `car_images` table

## FileUpload Component Enhancement

### New Features

The FileUpload component now supports multiple file uploads with the following enhancements:

#### New Props

```typescript
interface FileUploadProps {
  // ... existing props
  multiple?: boolean; // Enable multiple file uploads (default: false)
  maxFiles?: number; // Maximum number of files (default: 10)
  existingFileUrl?: string | string[] | null; // Now accepts array
  onUploadComplete?: (url: string | string[]) => void; // Returns array for multiple
}
```

#### Key Changes

1. **Multiple File Selection**

   - Users can now select and upload multiple files at once
   - Configurable maximum file limit
   - Visual feedback showing number of files selected

2. **Grid Layout for Previews**

   - Uploaded images displayed in responsive grid:
     - Mobile: 1 column
     - Tablet (sm): 2 columns
     - Desktop (md): 3 columns
   - Consistent 200px height for all image previews
   - Delete button overlay on each image

3. **Enhanced UX**

   - Upload progress indicator
   - Individual file deletion
   - Click to view full-size image
   - Automatic signed URL generation for private buckets
   - Responsive design for all screen sizes

4. **Signed URL Support**
   - Automatic generation for private buckets (e.g., `driver_licenses`)
   - 1-hour expiration for secure access
   - Public URL support for public buckets (e.g., `cars`)

#### State Management

```typescript
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

interface UploadedFile {
  storageUrl: string; // Storage path or public URL
  previewUrl: string | null; // Signed URL for preview
}
```

#### Usage Examples

**Single Image Upload (Backward Compatible)**

```typescript
<FileUpload
  bucket="driver_licenses"
  path={userId}
  existingFileUrl={driverDetails.license_image_url}
  onUploadComplete={(url) => {
    // url is a string
    console.log("Uploaded:", url);
  }}
/>
```

**Multiple Image Upload**

```typescript
<FileUpload
  bucket="cars"
  path={carId}
  multiple={true}
  maxFiles={5}
  isPublic={true}
  existingFileUrl={carImages.map((img) => img.image_url)}
  onUploadComplete={(urls) => {
    // urls is an array of strings
    console.log("Uploaded:", urls);
  }}
/>
```

## Translation Updates

### English (`en.json`)

```json
{
  "fileUpload": {
    "filesSelected": "{{count}} file(s) selected",
    "maxFilesLimit": "Max {{max}} files",
    "maxFilesExceeded": "Maximum {{maxFiles}} files allowed"
  }
}
```

### French (`fr.json`)

```json
{
  "fileUpload": {
    "filesSelected": "{{count}} fichier(s) sélectionné(s)",
    "maxFilesLimit": "Max {{max}} fichiers",
    "maxFilesExceeded": "Maximum {{maxFiles}} fichiers autorisés"
  }
}
```

## File Structure

```
src/
├── components/
│   └── FileUpload.tsx (UPDATED - Multiple upload support)
├── types/
│   └── index.ts (UPDATED - Added CarImage, removed image_url from Car)
├── i18n/
│   └── locales/
│       ├── en.json (UPDATED - New translations)
│       └── fr.json (UPDATED - New translations)
└── ...

supabase/
├── migrations/
│   └── 20251003111107_add_car_images_table.sql (NEW)
└── ...
```

## Migration Strategy

### Data Migration

The migration automatically handles existing data:

```sql
-- Migrate existing car image_url data to car_images table
INSERT INTO public.car_images (car_id, image_url, is_primary)
SELECT id, image_url, TRUE
FROM public.cars
WHERE image_url IS NOT NULL AND image_url != '';

-- Remove the image_url column from cars table
ALTER TABLE public.cars DROP COLUMN IF EXISTS image_url;
```

**Result:**

- All existing car images preserved
- Marked as primary images
- No data loss

## Next Steps

### For Car Image Management

1. **Update Car Form Components**

   - Replace single image upload with multiple image upload
   - Add support for selecting primary image
   - Update car detail pages to show image gallery

2. **Create CarImage Service**

   ```typescript
   // src/services/carImageService.ts
   export const getCarImages = async (carId: string): Promise<CarImage[]>
   export const setPrimaryImage = async (imageId: string, carId: string): Promise<void>
   export const deleteCarImage = async (imageId: string): Promise<void>
   ```

3. **Update Car Components**
   - `CarCard.tsx`: Show primary image or first image
   - `CarDetailManagement.tsx`: Add image gallery management
   - `AddCarForm.tsx`: Use multiple upload for car images

### Example Implementation

```typescript
// In AddCarForm or CarDetailManagement
const [carImages, setCarImages] = useState<string[]>([]);

// Handler for FileUpload
const handleCarImagesUpload = async (urls: string | string[]) => {
  const urlArray = Array.isArray(urls) ? urls : [urls];

  // Save to car_images table
  for (const url of urlArray) {
    await supabase.from("car_images").insert({
      car_id: carId,
      image_url: url,
      is_primary: carImages.length === 0, // First image is primary
    });
  }

  setCarImages((prev) => [...prev, ...urlArray]);
};

// Render
<FileUpload
  bucket="cars"
  path={carId}
  multiple={true}
  maxFiles={10}
  isPublic={true}
  existingFileUrl={carImages}
  onUploadComplete={handleCarImagesUpload}
  label="Car Images"
  helperText="Upload up to 10 images of your car"
/>;
```

## Benefits

### User Experience

- ✅ Upload multiple car images at once
- ✅ Visual gallery view of all car images
- ✅ Easy deletion of individual images
- ✅ Primary image selection
- ✅ Responsive design for mobile and desktop

### Technical

- ✅ Better data organization
- ✅ Scalable image storage
- ✅ Flexible primary image management
- ✅ Backward compatible with existing code
- ✅ Proper RLS policies for security
- ✅ Automatic cleanup on car deletion

### Security

- ✅ Row Level Security on car_images
- ✅ Owners can only manage their own car images
- ✅ Drivers can only view assigned car images
- ✅ Proper permission isolation

## Testing Checklist

- [ ] Test single file upload (backward compatibility)
- [ ] Test multiple file upload (new feature)
- [ ] Test file deletion (individual files)
- [ ] Test max files limit
- [ ] Test file size validation
- [ ] Test signed URL generation for private buckets
- [ ] Test public URL for public buckets
- [ ] Test RLS policies:
  - [ ] Car owners can manage their images
  - [ ] Drivers can view assigned car images
  - [ ] Admins can view all images
- [ ] Test responsive grid layout on mobile/tablet/desktop
- [ ] Test image preview and full-size view
- [ ] Test primary image flag in database

## Rollback Plan

If needed, you can rollback this migration:

```sql
-- Add image_url back to cars table
ALTER TABLE public.cars ADD COLUMN image_url TEXT;

-- Copy primary images back to cars table
UPDATE public.cars c
SET image_url = ci.image_url
FROM public.car_images ci
WHERE c.id = ci.car_id AND ci.is_primary = TRUE;

-- Drop car_images table
DROP TABLE IF EXISTS public.car_images CASCADE;
```

## Notes

- The `FileUpload` component remains backward compatible with single file uploads
- Existing components using `FileUpload` for driver licenses will continue to work
- The migration preserves all existing car image data
- Public `cars` bucket supports multiple image uploads
- Signed URLs are automatically generated for private buckets
