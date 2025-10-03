# FileUpload Component

A reusable file upload component for uploading files to Supabase Storage with proper RLS (Row Level Security) policies.

## Features

- Drag and drop interface (click to upload)
- File size validation
- File type validation
- Upload progress indicator
- Image preview with signed URLs for private buckets
- File delete functionality
- Fully responsive (mobile-first design)
- Internationalized (i18n support)
- Integrated with Supabase Storage
- Automatic signed URL generation for secure preview of private files

## Usage

### Basic Example - Driver License Upload (Private Bucket)

```tsx
import FileUpload from "../components/FileUpload";
import { useUserContext } from "../contexts/UserContext";

const DriverProfile: React.FC = () => {
  const { profile } = useUserContext();

  const handleUploadComplete = (url: string) => {
    console.log("File uploaded successfully:", url);
    // Update driver_details with license_image_url
    // For private buckets, this will be the storage path (e.g., "driver_id/timestamp.jpg")
  };

  return (
    <FileUpload
      bucket="driver_licenses"
      path={profile?.id || ""} // Folder name = driver's user ID
      accept="image/*,application/pdf"
      maxSizeMB={5}
      onUploadComplete={handleUploadComplete}
      label="Driver's License"
      helperText="Upload a clear photo of your driver's license (front and back)"
      isPublic={false} // Private bucket - signed URLs will be used for preview
    />
  );
};
```

### Example - Car Image Upload (Public Bucket)

```tsx
import FileUpload from "../components/FileUpload";

interface CarImageUploadProps {
  carId: string;
}

const CarImageUpload: React.FC<CarImageUploadProps> = ({ carId }) => {
  const handleUploadComplete = (url: string) => {
    console.log("Car image uploaded:", url);
    // Update cars table with image_url
    // For public buckets, this will be the full public URL
  };

  return (
    <FileUpload
      bucket="cars"
      path={carId} // Folder name = car ID
      accept="image/*"
      maxSizeMB={5}
      onUploadComplete={handleUploadComplete}
      label="Car Image"
      helperText="Upload a photo of your car"
      isPublic={true} // Public bucket - direct URLs will be used
    />
  );
};
```

## Props

| Prop               | Type                      | Required | Default     | Description                                                                   |
| ------------------ | ------------------------- | -------- | ----------- | ----------------------------------------------------------------------------- |
| `bucket`           | `string`                  | Yes      | -           | Storage bucket name (`driver_licenses` or `cars`)                             |
| `path`             | `string`                  | Yes      | -           | Folder path (usually user ID or car ID)                                       |
| `accept`           | `string`                  | No       | `"image/*"` | Accepted file types (e.g., `"image/*,application/pdf"`)                       |
| `maxSizeMB`        | `number`                  | No       | `5`         | Maximum file size in megabytes                                                |
| `onUploadComplete` | `(url: string) => void`   | No       | -           | Callback when upload completes successfully                                   |
| `onUploadError`    | `(error: string) => void` | No       | -           | Callback when upload fails                                                    |
| `existingFileUrl`  | `string \| null`          | No       | `null`      | URL/path of existing file (if any)                                            |
| `label`            | `string`                  | No       | -           | Label text above the upload area                                              |
| `helperText`       | `string`                  | No       | -           | Helper text below the label                                                   |
| `isPublic`         | `boolean`                 | No       | `false`     | Whether the bucket is public. If false, signed URLs are generated for preview |

## Storage Buckets

### 1. `driver_licenses` (Private Bucket)

**Purpose:** Store driver's license images for verification

**RLS Policies:**

- Drivers can upload files to folders named with their user ID
- Drivers can read/update/delete only their own files
- Admins can read all driver license files
- Folder structure: `{driver_id}/timestamp.ext`

**Example:**

```tsx
<FileUpload
  bucket="driver_licenses"
  path={driverId}
  accept="image/*,application/pdf"
/>
```

### 2. `cars` (Public Bucket)

**Purpose:** Store car images (publicly accessible)

**RLS Policies:**

- Car owners can upload files to folders named with their car ID
- Anyone can read car images (public bucket)
- Car owners can update/delete only their car files
- Folder structure: `{car_id}/timestamp.ext`

**Example:**

```tsx
<FileUpload bucket="cars" path={carId} accept="image/*" />
```

## File Naming Convention

Files are automatically named with timestamps to avoid conflicts:

```
{path}/{timestamp}.{extension}
```

Example:

- `abc-123-driver-id/1696320000000.jpg`
- `xyz-456-car-id/1696320123456.png`

## Permissions

### Driver License Uploads

- **Who can upload:** Authenticated drivers
- **Where:** `driver_licenses/{driver_id}/`
- **Access:** Only the driver and admins can see these files

### Car Image Uploads

- **Who can upload:** Car owners
- **Where:** `cars/{car_id}/`
- **Access:** Public (anyone can view)

## Signed URLs for Private Buckets

For private buckets like `driver_licenses`, the component automatically generates **signed URLs** for secure file preview:

### How It Works

1. When a file is uploaded to a private bucket, the storage path is saved (e.g., `driver_id/timestamp.jpg`)
2. The component automatically generates a signed URL using `createSignedUrl()` for preview
3. Signed URLs are temporary (1 hour expiration) and grant secure access to private files
4. When displaying an existing file, the component generates a new signed URL on load
5. **Smart URL Detection**: If an existing file URL is already a full URL (starts with http/https), it's used as-is to prevent URL duplication

### Benefits

- **Security:** Files in private buckets are not directly accessible via public URLs
- **Access Control:** Only authenticated users with proper permissions can generate signed URLs
- **Automatic:** The component handles signed URL generation transparently
- **No Manual Work:** Developers don't need to worry about URL generation

### Example Flow

```typescript
// Upload file
<FileUpload bucket="driver_licenses" path={userId} />

// 1. File uploaded to: driver_licenses/user-123/1696320000000.jpg
// 2. Storage path saved to database: "user-123/1696320000000.jpg"
// 3. Signed URL generated automatically for preview: "https://...supabase.co/storage/v1/object/sign/driver_licenses/user-123/1696320000000.jpg?token=..."
// 4. Preview displays using the signed URL
// 5. Signed URL expires after 1 hour (component regenerates on reload)
```

## Error Handling

The component handles common errors:

- File size too large
- Upload failure
- Delete failure
- Permission denied

Errors are displayed inline and can be captured via `onUploadError` callback.

## Styling

The component uses Material-UI components and follows the app's design system:

- Dashed border with hover effects
- Green accent color (#2e7d32)
- Smooth transitions
- Mobile-responsive layout

## Internationalization

All text is internationalized using react-i18next:

- `fileUpload.clickToUpload`
- `fileUpload.uploading`
- `fileUpload.fileUploaded`
- etc.

Supported languages: English, French

## References

- [Supabase Storage Upload](https://supabase.com/docs/reference/javascript/storage-from-upload)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
