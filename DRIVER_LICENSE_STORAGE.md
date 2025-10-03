# Driver License Storage Implementation

## Overview

Driver license images are now managed using a **storage-first approach**. Images are stored in Supabase Storage's `driver_licenses` bucket and fetched dynamically rather than relying on database URLs.

## Key Changes

### 1. Storage-First Architecture

- **Images are stored** in the `driver_licenses` bucket under `{profile_id}/` paths
- **Preview URLs are fetched** dynamically from Supabase Storage
- **Database field** (`license_image_url`) is deprecated for preview purposes

### 2. Why This Approach?

**Benefits:**
- **Single source of truth**: Storage bucket is the authoritative source
- **Security**: Signed URLs expire automatically (1 hour)
- **Flexibility**: Easy to implement multiple file support in the future
- **Consistency**: Same pattern can be used for other document types
- **No stale URLs**: Always fetch fresh URLs from storage

**Previous Issues:**
- Database URLs could become stale
- Hard to manage multiple files per user
- Preview relied on database synchronization

## Implementation Details

### Service Layer

**`driverLicenseService.ts`** provides methods to:
- `getDriverLicenseFiles(profileId)` - List all license files for a user
- `getDriverLicenseUrls(profileId)` - Get signed URLs for all files
- `getFirstDriverLicenseUrl(profileId)` - Get the most recent file URL
- `deleteDriverLicenseFile(filePath)` - Delete a specific file
- `deleteAllDriverLicenseFiles(profileId)` - Delete all files for a user
- `uploadDriverLicenseFile(profileId, file)` - Upload a new file

### Component Integration

**Profile.tsx** and **DriverDetailsCompletion.tsx**:

```typescript
// On component load - fetch from storage
const imageUrl = await driverLicenseService.getFirstDriverLicenseUrl(profile.id);
setLicenseImageUrl(imageUrl);

// On upload - refresh from storage
onUploadComplete={async (url) => {
  if (!urlString) {
    // File was deleted - clear database field
    await driverDetailsService.updateDriverDetails(profile.id, { 
      license_image_url: null 
    });
    setLicenseImageUrl(null);
  } else {
    // File was uploaded - fetch fresh URL from storage
    const imageUrl = await driverLicenseService.getFirstDriverLicenseUrl(profile.id);
    setLicenseImageUrl(imageUrl);
    
    // Update database with file path
    await driverDetailsService.updateDriverDetails(profile.id, { 
      license_image_url: urlString 
    });
  }
}}
```

## Database Schema

### Migration: `20251003170828_deprecate_license_image_url_field.sql`

The `license_image_url` field in `driver_details` table is now deprecated for preview purposes:

```sql
COMMENT ON COLUMN driver_details.license_image_url IS 
  'DEPRECATED: This field is no longer used for preview. Images are now fetched 
   directly from the driver_licenses storage bucket using profile_id. This field 
   may be removed in a future migration.';
```

**Why not drop the column?**
- Maintains backward compatibility
- Allows gradual migration
- Can still track which users have uploaded files (for analytics)

## Storage Bucket Structure

```
driver_licenses/
├── {profile_id_1}/
│   ├── 1696234567890_abc123.jpg
│   └── 1696234589012_def456.pdf
├── {profile_id_2}/
│   └── 1696234600000_ghi789.jpg
└── ...
```

## Usage Examples

### Fetching License Image for Display

```typescript
import { driverLicenseService } from "../services/driverLicenseService";

// Get the most recent license image
const imageUrl = await driverLicenseService.getFirstDriverLicenseUrl(userId);

// Get all license images (for multiple file support)
const imageUrls = await driverLicenseService.getDriverLicenseUrls(userId);
```

### Deleting License Image

```typescript
// Delete specific file
const filePath = `${userId}/1696234567890_abc123.jpg`;
await driverLicenseService.deleteDriverLicenseFile(filePath);

// Clear database field
await driverDetailsService.updateDriverDetails(userId, { 
  license_image_url: null 
});
```

### Checking if User Has License Image

```typescript
const files = await driverLicenseService.getDriverLicenseFiles(userId);
const hasLicenseImage = files.length > 0;
```

## Security Considerations

### Row Level Security (RLS)

The `driver_licenses` bucket has RLS policies that:
- Allow drivers to upload/view/delete their own files
- Allow owners to view driver license files for assigned drivers
- Prevent unauthorized access

### Signed URLs

- All preview URLs are signed with 1-hour expiration
- URLs are regenerated on each page load
- No permanent public access to license images

## Testing

### Manual Testing

1. **Upload Test**:
   - Go to Profile page
   - Upload a driver's license image
   - Verify image appears in preview
   - Check database: `license_image_url` should contain file path

2. **Delete Test**:
   - Delete the uploaded image
   - Verify image preview disappears
   - Check database: `license_image_url` should be NULL

3. **Persistence Test**:
   - Upload an image
   - Refresh the page
   - Verify image still appears (fetched from storage)

### Automated Testing (Future)

```typescript
describe("Driver License Service", () => {
  test("should fetch license image from storage", async () => {
    const url = await driverLicenseService.getFirstDriverLicenseUrl(testUserId);
    expect(url).toContain("driver_licenses");
  });

  test("should clear database field on delete", async () => {
    await driverLicenseService.deleteAllDriverLicenseFiles(testUserId);
    const details = await driverDetailsService.getDriverDetails(testUserId);
    expect(details.license_image_url).toBeNull();
  });
});
```

## Migration Path

### For Existing Data

If you have existing users with `license_image_url` values:

1. **Option 1: Leave as-is**
   - New uploads will use storage-first approach
   - Old URLs will continue to work until refreshed
   - No data migration needed

2. **Option 2: Migrate existing URLs**
   - Create a script to move existing images to new structure
   - Update paths in database
   - Ensure all images are in correct bucket structure

### Future Enhancements

1. **Multiple File Support**:
   - Modify UI to show all uploaded files
   - Use `getDriverLicenseUrls()` instead of `getFirstDriverLicenseUrl()`

2. **Image Compression**:
   - Add compression before upload
   - Reduce storage costs and improve load times

3. **OCR Integration**:
   - Extract license data automatically from images
   - Use OpenAI Vision API (already implemented!)
   - Auto-fill license number, expiry date, etc.

4. **Remove Database Field**:
   - After full migration, remove `license_image_url` column
   - Rely entirely on storage for image management

## Troubleshooting

### Image Not Loading

**Symptoms**: Image preview shows empty or loading state

**Possible Causes**:
1. RLS policy blocking access
2. File doesn't exist in storage
3. Signed URL expired

**Solutions**:
```typescript
// Check if files exist
const files = await driverLicenseService.getDriverLicenseFiles(userId);
console.log("Files in storage:", files);

// Generate fresh signed URL
const url = await driverLicenseService.getFirstDriverLicenseUrl(userId);
console.log("Signed URL:", url);

// Verify RLS policies
// Check Supabase Dashboard > Storage > driver_licenses > Policies
```

### Image Not Deleting

**Symptoms**: Image still appears after deletion

**Possible Causes**:
1. Storage deletion failed
2. Database not updated
3. Component state not refreshed

**Solutions**:
```typescript
// Force refresh from storage
const imageUrl = await driverLicenseService.getFirstDriverLicenseUrl(userId);
setLicenseImageUrl(imageUrl);

// Verify deletion in storage
const files = await driverLicenseService.getDriverLicenseFiles(userId);
console.log("Remaining files:", files); // Should be empty

// Check database
const details = await driverDetailsService.getDriverDetails(userId);
console.log("DB field:", details.license_image_url); // Should be null
```

## Related Files

- `/src/services/driverLicenseService.ts` - Service layer
- `/src/services/driverDetailsService.ts` - Database operations
- `/src/pages/Profile.tsx` - Main profile page
- `/src/pages/DriverDetailsCompletion.tsx` - Driver onboarding
- `/src/components/FileUpload.tsx` - File upload component
- `/supabase/migrations/20251003170828_deprecate_license_image_url_field.sql` - Migration

## Support

For issues or questions:
1. Check this documentation
2. Review service methods in `driverLicenseService.ts`
3. Check Supabase Storage dashboard
4. Verify RLS policies are correctly configured
