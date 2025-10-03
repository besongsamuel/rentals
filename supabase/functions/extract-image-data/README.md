# Extract Image Data Edge Function

This edge function uses OpenAI's Vision API to extract structured data from images.

## Supported Image Types

### 1. Car Images

Extracts the following information:

- `make`: Car manufacturer/brand (e.g., Toyota, Honda, Ford)
- `model`: Car model name (e.g., Camry, Civic, F-150)
- `license_plate`: License plate number visible on the car

### 2. Driver's License Images

Extracts the following information:

- `license_number`: The driver's license number
- `license_class`: The license class/category (e.g., Class A, Class B, Class C)
- `issue_date`: The date the license was issued (YYYY-MM-DD format)
- `expiry_date`: The expiration date of the license (YYYY-MM-DD format)
- `issuing_authority`: The state, province, or authority that issued the license

## Environment Variables Required

- `OPENAI_API_KEY`: Your OpenAI API key with access to GPT-4 Vision

## Request Format

```json
{
  "image": "base64_encoded_image_or_url",
  "image_type": "car" | "drivers_license"
}
```

The `image` field can be either:

- A base64 encoded image (with or without data URI prefix)
- A publicly accessible image URL

## Response Format

### Success Response

#### Car Image:

```json
{
  "success": true,
  "image_type": "car",
  "data": {
    "make": "Toyota",
    "model": "Camry",
    "license_plate": "ABC123"
  }
}
```

#### Driver's License Image:

```json
{
  "success": true,
  "image_type": "drivers_license",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "license_number": "D1234567",
    "license_class": "Class C",
    "issue_date": "2020-01-15",
    "expiry_date": "2025-01-15",
    "issuing_authority": "California DMV"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Usage Example

### Using fetch (JavaScript/TypeScript)

```typescript
const extractImageData = async (
  imageBase64: string,
  imageType: "car" | "drivers_license"
) => {
  const response = await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/extract-image-data`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        image: imageBase64,
        image_type: imageType,
      }),
    }
  );

  const result = await response.json();
  return result;
};

// Usage
const carData = await extractImageData(carImageBase64, "car");
const licenseData = await extractImageData(
  licenseImageBase64,
  "drivers_license"
);
```

### Using Supabase Client

```typescript
import { supabase } from "./lib/supabase";

const extractImageData = async (
  imageBase64: string,
  imageType: "car" | "drivers_license"
) => {
  const { data, error } = await supabase.functions.invoke(
    "extract-image-data",
    {
      body: {
        image: imageBase64,
        image_type: imageType,
      },
    }
  );

  if (error) throw error;
  return data;
};
```

## Notes

- The function uses GPT-4 Vision (`gpt-4o` model) for high accuracy
- Temperature is set to 0.1 for consistent extraction results
- All fields return `null` if the information cannot be determined from the image
- Dates are always returned in `YYYY-MM-DD` format
- The function includes proper CORS headers for browser access
- Image quality affects extraction accuracy - use high-resolution images when possible

## Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy extract-image-data
```

Set the required environment variable:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

## Testing Locally

```bash
supabase functions serve extract-image-data
```

Then send a POST request to `http://localhost:54321/functions/v1/extract-image-data`
