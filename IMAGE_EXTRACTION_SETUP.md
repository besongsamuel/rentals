# Image Data Extraction Setup Guide

This guide explains how to set up and use the OpenAI-powered image data extraction edge function.

## Overview

The `extract-image-data` edge function uses OpenAI's Vision API (GPT-4o) to extract structured data from images. It supports two types of images:

1. **Car Images** - Extracts make, model, and license plate number
2. **Driver's License Images** - Extracts license number, class, issue/expiry dates, and issuing authority

## Prerequisites

- Supabase CLI installed
- OpenAI API account with access to GPT-4 Vision (GPT-4o model)
- Active Supabase project

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (you won't be able to see it again)

### 2. Deploy the Edge Function

Deploy the function to your Supabase project:

```bash
# Make sure you're linked to your Supabase project
supabase link

# Deploy the function
supabase functions deploy extract-image-data
```

### 3. Set Environment Variable

Set the OpenAI API key as a secret in your Supabase project:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

Verify the secret was set:

```bash
supabase secrets list
```

### 4. Test the Function

Test locally first:

```bash
# Start local development
supabase functions serve extract-image-data

# In another terminal, test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/extract-image-data' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "image": "https://example.com/car-image.jpg",
    "image_type": "car"
  }'
```

## Usage in Your Application

### Basic Usage

```typescript
import {
  extractCarData,
  extractDriversLicenseData,
} from "./services/imageExtraction";

// Extract car data
const handleCarImage = async (file: File) => {
  try {
    const carData = await extractCarData(file);
    console.log("Car Data:", carData);
    // { make: "Toyota", model: "Camry", license_plate: "ABC123" }
  } catch (error) {
    console.error("Extraction failed:", error);
  }
};

// Extract driver's license data
const handleLicenseImage = async (file: File) => {
  try {
    const licenseData = await extractDriversLicenseData(file);
    console.log("License Data:", licenseData);
    // {
    //   license_number: "D1234567",
    //   license_class: "Class C",
    //   issue_date: "2020-01-15",
    //   expiry_date: "2025-01-15",
    //   issuing_authority: "California DMV"
    // }
  } catch (error) {
    console.error("Extraction failed:", error);
  }
};
```

### Integration with Forms

```typescript
import React, { useState } from "react";
import { extractCarData, CarData } from "./services/imageExtraction";
import { TextField, Button, Box } from "@mui/material";

const CarForm: React.FC = () => {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    licensePlate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await extractCarData(file);

      // Auto-fill form with extracted data
      setFormData({
        make: data.make || "",
        model: data.model || "",
        licensePlate: data.license_plate || "",
      });
    } catch (error) {
      console.error("Failed to extract car data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <input
        accept="image/*"
        type="file"
        onChange={handleImageUpload}
        style={{ display: "none" }}
        id="car-image-upload"
      />
      <label htmlFor="car-image-upload">
        <Button variant="outlined" component="span" disabled={loading}>
          {loading ? "Extracting..." : "Upload Car Image"}
        </Button>
      </label>

      <TextField
        label="Make"
        value={formData.make}
        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Model"
        value={formData.model}
        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="License Plate"
        value={formData.licensePlate}
        onChange={(e) =>
          setFormData({ ...formData, licensePlate: e.target.value })
        }
        fullWidth
        margin="normal"
      />
    </Box>
  );
};
```

### Using with FileUpload Component

```typescript
import { extractCarData } from "./services/imageExtraction";
import { FileUpload } from "./components/FileUpload";

const CarImageUpload: React.FC = () => {
  const handleUploadComplete = async (urls: string[]) => {
    if (urls.length > 0) {
      try {
        // Extract data from the uploaded image
        const carData = await extractCarData(urls[0]);
        console.log("Extracted car data:", carData);

        // Use the extracted data to auto-fill your form
        // ...
      } catch (error) {
        console.error("Failed to extract data:", error);
      }
    }
  };

  return (
    <FileUpload
      bucketName="car-images"
      onUploadComplete={handleUploadComplete}
      maxFiles={1}
      acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
    />
  );
};
```

## API Reference

### Request Format

```typescript
interface RequestPayload {
  image: string; // Base64 encoded image or image URL
  image_type: "car" | "drivers_license";
}
```

### Response Format

#### Car Data Response

```typescript
interface CarDataResponse {
  success: true;
  image_type: "car";
  data: {
    make: string | null;
    model: string | null;
    license_plate: string | null;
  };
}
```

#### Driver's License Response

```typescript
interface DriversLicenseResponse {
  success: true;
  image_type: "drivers_license";
  data: {
    license_number: string | null;
    license_class: string | null;
    issue_date: string | null; // YYYY-MM-DD format
    expiry_date: string | null; // YYYY-MM-DD format
    issuing_authority: string | null;
  };
}
```

#### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: string;
}
```

## Cost Considerations

### OpenAI API Costs

The function uses GPT-4o (GPT-4 with vision) which has the following pricing (as of 2024):

- **Input**: ~$0.01 per 1K tokens
- **Output**: ~$0.03 per 1K tokens
- **Image processing**: Additional cost based on image size and detail level

**Estimated cost per extraction**: $0.01 - $0.05 per image

### Cost Optimization Tips

1. **Image Size**: Resize images before sending to reduce processing time
2. **Detail Level**: The function uses "high" detail for accuracy. Consider "low" for simple extractions
3. **Caching**: Cache results for the same image to avoid redundant API calls
4. **Batch Processing**: If extracting from multiple images, consider rate limiting

## Best Practices

### Image Quality

For best extraction results:

- Use high-resolution images (at least 1024x1024 pixels)
- Ensure good lighting and minimal glare
- Capture the entire object (car or license) in frame
- Avoid obstructions or partial views

### Error Handling

Always implement proper error handling:

```typescript
try {
  const data = await extractCarData(image);

  // Check for missing fields
  if (!data.make || !data.model) {
    console.warn("Some data could not be extracted");
  }

  // Use the data
  processCarData(data);
} catch (error) {
  // Handle errors gracefully
  console.error("Extraction failed:", error);
  showErrorMessage("Failed to extract data. Please enter manually.");
}
```

### User Experience

1. **Loading States**: Show loading indicators during extraction
2. **Manual Override**: Allow users to edit auto-filled data
3. **Validation**: Validate extracted data before submission
4. **Retry Logic**: Implement retry for failed extractions
5. **Fallback**: Provide manual input as fallback

## Troubleshooting

### Common Issues

**Issue**: "OPENAI_API_KEY is not configured"

- **Solution**: Make sure you've set the secret: `supabase secrets set OPENAI_API_KEY=your_key`

**Issue**: "OpenAI API error: 401"

- **Solution**: Check that your OpenAI API key is valid and has sufficient credits

**Issue**: "Failed to extract data" with null values

- **Solution**:
  - Ensure image quality is sufficient
  - Check that the image actually contains the expected data
  - Try with a different image

**Issue**: CORS errors

- **Solution**: The function includes proper CORS headers. Ensure you're calling it from an allowed origin

### Debugging

Enable detailed logging:

```typescript
const extractCarDataWithLogging = async (image: File) => {
  console.log("Starting extraction for:", image.name);

  try {
    const data = await extractCarData(image);
    console.log("Extraction successful:", data);
    return data;
  } catch (error) {
    console.error("Extraction failed:", error);
    throw error;
  }
};
```

## Security Considerations

1. **API Key Protection**: Never expose your OpenAI API key in client-side code
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Image Validation**: Validate image size and type before sending to function
4. **PII Handling**: Be aware that driver's license images contain sensitive personal information
5. **Data Storage**: Consider privacy implications when storing extracted data

## Monitoring

Monitor your usage:

1. **OpenAI Dashboard**: Track API usage and costs
2. **Supabase Logs**: Monitor edge function invocations
3. **Error Tracking**: Implement error tracking to catch extraction failures

```bash
# View function logs
supabase functions logs extract-image-data
```

## Future Enhancements

Potential improvements:

- Support for additional document types (insurance cards, registration, etc.)
- Multi-language support for international licenses
- Confidence scores for extracted fields
- Batch processing for multiple images
- Caching layer to reduce API costs
- Custom validation rules per field

## Support

For issues or questions:

1. Check the function logs: `supabase functions logs extract-image-data`
2. Review the README in `supabase/functions/extract-image-data/`
3. Test locally with `supabase functions serve`
4. Check OpenAI API status at status.openai.com
