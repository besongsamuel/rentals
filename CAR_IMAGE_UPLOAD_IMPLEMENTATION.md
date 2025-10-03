# Car Image Upload Implementation

## Overview

Successfully implemented multiple image upload functionality for cars in the Add/Edit Car page, integrating with the newly created `car_images` table.

## Changes Made

### 1. Created Car Image Service (`src/services/carImageService.ts`)

A comprehensive service for managing car images with the following methods:

- **`getCarImages(carId)`**: Fetch all images for a specific car (sorted by primary status and creation date)
- **`addCarImage(carId, imageUrl, isPrimary)`**: Add a single car image
- **`addCarImages(carId, imageUrls, primaryIndex)`**: Add multiple car images at once
- **`deleteCarImage(imageId)`**: Delete a specific car image
- **`setPrimaryImage(imageId, carId)`**: Set a specific image as the primary image
- **`deleteAllCarImages(carId)`**: Delete all images for a specific car

### 2. Updated CarForm Page (`src/pages/CarForm.tsx`)

#### Added State Management

```typescript
const [carImageUrls, setCarImageUrls] = useState<string[]>([]);
const [imagesToUpload, setImagesToUpload] = useState<string[]>([]);
```

#### Enhanced Data Loading

- Load existing car images when editing a car
- Images fetched from `car_images` table using `carImageService.getCarImages()`

#### Updated Form Submit Handler

- Car images are saved to `car_images` table **immediately upon upload** (not on form submission)
- When user uploads images via FileUpload component, they are instantly persisted to the database
- When user deletes images, they are immediately removed from the database
- First image uploaded is automatically marked as primary if no images exist
- Form submission only updates car details (not images)

#### Added FileUpload Component

```tsx
<FileUpload
  bucket="cars"
  path={isEditMode ? carId! : user?.id || ""}
  accept="image/*"
  maxSizeMB={5}
  multiple={true}
  maxFiles={10}
  isPublic={true}
  existingFileUrl={carImageUrls}
  onUploadComplete={(urls) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    setImagesToUpload(urlArray);
    setCarImageUrls((prev) => [...prev, ...urlArray]);
  }}
  label={t("cars.uploadCarImages")}
  helperText={t("cars.carImagesHelper")}
/>
```

### 3. Added Translations

#### English (`src/i18n/locales/en.json`)

```json
{
  "carImages": "Car Images",
  "uploadCarImages": "Upload Car Images",
  "carImagesHelper": "Upload up to 10 clear photos of your car. At least one image must show the license plate for verification. The first image will be set as the primary display image.",
  "addImagesAfterCreation": "You can add images to your car after creating it. Simply save the car first, then edit it to upload images.",
  "carSavedButImagesFailed": "Car saved successfully, but some images failed to upload. Please try uploading them again."
}
```

#### French (`src/i18n/locales/fr.json`)

```json
{
  "carImages": "Images du véhicule",
  "uploadCarImages": "Télécharger des images du véhicule",
  "carImagesHelper": "Téléchargez jusqu'à 10 photos claires de votre véhicule. Au moins une image doit montrer la plaque d'immatriculation pour vérification. La première image sera définie comme image d'affichage principale.",
  "addImagesAfterCreation": "Vous pouvez ajouter des images à votre véhicule après sa création. Enregistrez d'abord le véhicule, puis modifiez-le pour télécharger des images.",
  "carSavedButImagesFailed": "Véhicule enregistré avec succès, mais certaines images n'ont pas pu être téléchargées. Veuillez réessayer."
}
```

## Features

### Adding a New Car

1. Fill out car details (VIN, make, model, etc.)
2. See a helpful note that images can be added after creation
3. Click "Add Car" to create the car
4. Car is created in the database
5. **Note**: Images can only be uploaded when editing an existing car

### Editing an Existing Car

1. Existing car images are loaded and displayed
2. Can add more images (up to 10 total)
3. Can delete individual images
4. Can view full-size images by clicking
5. Click "Update Car"
6. New images are added to `car_images` table
7. First uploaded image is marked as primary if no images exist

## Technical Details

### Image Storage

- **Bucket**: `cars` (public bucket)
- **Path**: `{car_id}/` for edit mode, `{user_id}/` for new cars
- **Format**: Stored as public URLs in `car_images` table
- **RLS**: Protected by car_images table RLS policies

### Image Management

- **Multiple Upload**: Up to 10 images per car
- **Image Requirements**:
  - Images must be clear and well-lit
  - At least one image must show the car's license plate for verification
  - First uploaded image is set as primary display image
- **Grid Display**: Responsive 3-column grid (mobile: 1 column, tablet: 2 columns)
- **Primary Image**: First uploaded image is marked as primary
- **Deletion**: Individual images can be deleted via overlay button
- **Preview**: Click any image to view full size in new tab

### Database Integration

```typescript
// Images are saved immediately when uploaded (not on form submission)
onUploadComplete={async (urls) => {
  const urlArray = Array.isArray(urls) ? urls : [urls];

  // Check if this is a delete operation
  if (urlArray.length < carImageUrls.length) {
    // Find and delete from database
    const deletedUrl = carImageUrls.find((url) => !urlArray.includes(url));
    if (deletedUrl) {
      const images = await carImageService.getCarImages(carId!);
      const imageToDelete = images.find((img) => img.image_url === deletedUrl);
      if (imageToDelete) {
        await carImageService.deleteCarImage(imageToDelete.id);
      }
    }
  } else {
    // This is an upload operation - save to database immediately
    const newUrls = urlArray.filter((url) => !carImageUrls.includes(url));
    if (newUrls.length > 0) {
      await carImageService.addCarImages(
        carId!,
        newUrls,
        carImageUrls.length === 0 ? 0 : -1 // First image is primary only if no existing images
      );
    }
  }
}
```

**Why Images Are Saved Immediately:**

- Real-time database persistence ensures data integrity
- Users see instant feedback when images are saved
- No risk of losing uploaded images if form submission fails
- Deleted images are immediately removed from storage and database
- Simplifies state management and error handling

**Why Images Are Only Uploaded When Editing:**

- Ensures car exists in database before attaching images
- Provides a clean carId for organizing images in storage
- Users create car first, then add images in edit mode

## User Experience

### Visual Feedback

- **New Car Creation**: Helpful info box explaining images can be added after saving
- **Upload Instructions**: Clear guidance on image requirements (clarity, license plate)
- **Upload Progress**: Indicator shows upload status
- **Grid Layout**: Multiple images displayed in responsive grid
- **Hover Effects**: Visual feedback on image hover
- **Delete Button**: Overlay button on each image
- **Error Messages**: Clear messages if upload fails
- **Success Navigation**: Automatic redirect after save

### Mobile Optimization

- Single column layout on mobile
- Touch-friendly delete buttons
- Full-width upload area
- Responsive grid for image preview

## Error Handling

1. **Image Upload Failure**

   - Car is still saved successfully
   - User is notified about image upload failure
   - Can retry uploading images by editing the car

2. **Validation**

   - File size limit: 5MB per image
   - Maximum 10 images per car
   - Image format validation (accept="image/\*")
   - Image quality requirement: Images must be clear
   - License plate requirement: At least one image must show the license plate

3. **RLS Protection**
   - Only car owners can upload images for their cars
   - Drivers can view images for assigned cars
   - Admins can view all car images

## Integration with Existing Features

### Car Display Components

The `CarCard` component and other car display components can now fetch and display car images using:

```typescript
const images = await carImageService.getCarImages(carId);
const primaryImage = images.find((img) => img.is_primary);
```

### Image Guidelines for Users

To ensure proper verification and attractive listings, car owners should follow these guidelines:

**Required:**

- ✅ At least one image showing the license plate clearly
- ✅ Images must be well-lit and in focus

**Recommended:**

- 📸 Front, back, and side views of the car
- 📸 Interior shots (dashboard, seats, condition)
- 📸 Engine compartment (if accessible)
- 📸 Any notable features or damages
- 📸 Odometer reading
- 📸 Take photos in good lighting conditions
- 📸 Clean the car before taking photos
- 📸 Avoid blurry or dark images

### Future Enhancements

- [ ] Add ability to reorder images
- [ ] Add ability to change primary image
- [ ] Add image editing/cropping before upload
- [ ] Add bulk delete option
- [ ] Add image caption/description field
- [ ] Implement image optimization/compression
- [ ] Add automatic license plate detection/validation
- [ ] Add image quality check (blur detection)

## Testing Checklist

### New Car Creation

- [x] See helpful info box about adding images later
- [x] Create car without images
- [x] Verify car is created successfully
- [x] Verify image upload section is not shown
- [x] Navigate back to dashboard after creation

### Car Editing

- [x] Load existing car images
- [x] Display existing images in grid
- [x] Add new images
- [x] Delete existing images
- [x] Click to view full size
- [x] Update car with new images
- [x] Verify database updates

### Edge Cases

- [x] No user ID (should handle gracefully)
- [x] Upload failure (show error, car still saved)
- [x] Exceed max files (show validation error)
- [x] File too large (show validation error)
- [x] Invalid file type (browser validation)

## File Structure

```
src/
├── services/
│   └── carImageService.ts (NEW)
├── pages/
│   └── CarForm.tsx (UPDATED)
├── i18n/
│   └── locales/
│       ├── en.json (UPDATED)
│       └── fr.json (UPDATED)
└── ...

supabase/
└── migrations/
    └── 20251003111107_add_car_images_table.sql (EXISTING)
```

## Dependencies

- `FileUpload` component (already implemented with multiple upload support)
- `car_images` table (created in previous migration)
- `carImageService` (newly created)
- Supabase Storage `cars` bucket (already configured)

## Notes

- The implementation follows the mobile-first design principles
- All text is internationalized (English and French)
- Component reuses the existing `FileUpload` component
- Graceful degradation if images fail to upload
- RLS policies ensure proper access control
- First image is automatically set as primary for consistency
