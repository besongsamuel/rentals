# Verify Users Edge Function

This edge function automatically verifies users by comparing license numbers from the `driver_details` table with extracted license numbers from the `extracted_user_data` table.

## Purpose

When a user completes their driver details or when AI-extracted license data is saved, this function automatically:

1. Retrieves the license number from `driver_details`
2. Retrieves the extracted license number from `extracted_user_data`
3. Compares them (case-insensitive)
4. Sets `is_verified = true` in the `driver_details` table if they match

## Trigger

This function is triggered by database webhooks on:

- `driver_details` table (INSERT/UPDATE operations)
- `extracted_user_data` table (INSERT/UPDATE operations, only for `drivers_license` type)

## Webhook Payload Structure

```typescript
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record?: any;
  old_record?: any;
  schema: string;
}
```

## Function Logic

1. **Webhook Processing**: Receives database webhook payload
2. **User Identification**: Extracts user ID from the webhook payload
3. **Data Retrieval**: Fetches license number from both tables
4. **Comparison**: Compares license numbers (case-insensitive, trimmed)
5. **Verification**: Updates `profiles.is_verified` to `true` if numbers match

## Database Tables Used

### `driver_details`

- `profile_id`: Links to the user profile
- `license_number`: The manually entered license number

### `extracted_user_data`

- `user_id`: Links to the user
- `type`: Must be `'drivers_license'`
- `extracted_data.license_number`: The AI-extracted license number

### `driver_details`

- `profile_id`: User identifier
- `is_verified`: Boolean flag set to `true` when verification succeeds

## Response Format

### Success (License numbers match)

```json
{
  "message": "User verified successfully",
  "userId": "uuid",
  "verified": true
}
```

### Failure (License numbers don't match)

```json
{
  "message": "License numbers do not match",
  "userId": "uuid",
  "verified": false,
  "driverLicense": "abc123",
  "extractedLicense": "abc124"
}
```

### Error

```json
{
  "error": "Error message"
}
```

## Environment Variables Required

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

## CORS Support

The function includes CORS headers to support cross-origin requests:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`

## Error Handling

The function handles various error scenarios:

- Missing user ID
- Database query failures
- Missing license numbers
- Invalid table operations
- Network/connection errors

## Logging

Comprehensive logging is included for debugging:

- Webhook payload details
- User ID extraction
- License number comparison
- Verification results
- Error details

## Security

- Uses service role key for database access
- Validates webhook payload structure
- Handles CORS preflight requests
- Input sanitization for license number comparison
