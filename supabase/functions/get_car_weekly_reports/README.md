# Get Car Weekly Reports Edge Function

This Supabase Edge Function retrieves weekly reports for a specific car with proper authentication and authorization.

## Purpose

Allows authenticated users (drivers and owners) to fetch weekly reports for cars they have access to, with proper permission checks.

## Authentication

- Requires a valid JWT token in the Authorization header
- Token must be from an authenticated user with a profile

## Authorization Rules

### For Drivers

- Can only access weekly reports for cars they are assigned to (`cars.driver_id = user_id`)

### For Owners

- Can access weekly reports for cars they own directly (`cars.owner_id = user_id`)
- Can access weekly reports for cars they co-own (`car_owners.owner_id = user_id`)

## Request Format

```json
{
  "car_id": "uuid-string"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "reports": [
    {
      "id": "uuid",
      "car_id": "uuid",
      "driver_id": "uuid",
      "week_start_date": "2024-01-01",
      "week_end_date": "2024-01-07",
      "start_mileage": 1000,
      "end_mileage": 1200,
      "driver_earnings": 500.0,
      "maintenance_expenses": 50.0,
      "gas_expense": 100.0,
      "ride_share_income": 300.0,
      "rental_income": 200.0,
      "currency": "XAF",
      "status": "submitted",
      "submitted_at": "2024-01-08T10:00:00Z",
      "approved_at": null,
      "approved_by": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-08T10:00:00Z"
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

## Error Codes

- `400` - Bad Request (missing car_id, invalid token, etc.)
- `403` - Forbidden (user doesn't have access to the car)
- `500` - Internal Server Error

## Usage Example

```javascript
const response = await fetch("/functions/v1/get_car_weekly_reports", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    car_id: "your-car-uuid",
  }),
});

const data = await response.json();
if (data.success) {
  console.log("Weekly reports:", data.reports);
} else {
  console.error("Error:", data.error);
}
```

## Security Features

- JWT token validation
- User type verification (driver/owner)
- Car assignment/ownership checks
- Proper error handling with appropriate HTTP status codes
- CORS support for web applications
