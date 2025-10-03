# Send Email Edge Function

This Supabase Edge Function handles sending email notifications using SendGrid for various events in the mo kumbi application.

## Supported Email Types

1. **drive_request** - Sent to car owners when a new drive request is created
2. **weekly_report_submitted** - Sent to car owners when a weekly report is submitted

## Setup Instructions

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Configure SendGrid

You'll need to set up the following environment variables in your Supabase project:

#### Required Environment Variables:
- `SENDGRID_API_KEY` - Your SendGrid API key
- `SENDGRID_FROM_EMAIL` - The email address to send from (must be verified in SendGrid)
- `SENDGRID_DRIVE_REQUEST_TEMPLATE_ID` - SendGrid template ID for drive requests
- `SENDGRID_WEEKLY_REPORT_TEMPLATE_ID` - SendGrid template ID for weekly reports

#### To set environment variables:
```bash
# Using Supabase CLI
supabase secrets set SENDGRID_API_KEY=your_api_key_here
supabase secrets set SENDGRID_FROM_EMAIL=noreply@mokumbi.com
supabase secrets set SENDGRID_DRIVE_REQUEST_TEMPLATE_ID=d-xxxxxxxxxxxxx
supabase secrets set SENDGRID_WEEKLY_REPORT_TEMPLATE_ID=d-xxxxxxxxxxxxx
```

Or set them in the Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add the secrets there

### 3. Enable pg_net Extension

The email triggers use the `pg_net` extension for async HTTP calls. Enable it:

```sql
-- Run this in your Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 4. Configure Edge Function URL

Set the edge function URL in your database settings:

```sql
-- Run this in your Supabase SQL Editor
-- Replace <project-ref> with your actual Supabase project reference
ALTER DATABASE postgres SET app.settings.edge_function_url = 'https://<project-ref>.supabase.co/functions/v1/send-email';
ALTER DATABASE postgres SET app.settings.service_role_key = '<your-service-role-key>';
```

### 5. Deploy the Edge Function

```bash
# From the project root
supabase functions deploy send-email
```

### 6. Apply the Migration

```bash
# Apply the email notification triggers
supabase db push
```

## SendGrid Template Setup

### Drive Request Template

Template ID: Set in `SENDGRID_DRIVE_REQUEST_TEMPLATE_ID`

**Dynamic Template Data:**
- `owner_name` - Car owner's name
- `driver_name` - Driver's name
- `driver_phone` - Driver's phone number
- `driver_email` - Driver's email
- `car_make` - Car make
- `car_model` - Car model
- `car_year` - Car year
- `car_license_plate` - Car license plate
- `start_date` - Request start date
- `end_date` - Request end date (or "Indefinite")
- `max_hours_per_week` - Maximum hours per week
- `driver_notes` - Driver's notes
- `experience_details` - Driver's experience details
- `request_id` - Request ID

**Sample Template:**
```html
<p>Hello {{owner_name}},</p>

<p>You have received a new drive request for your {{car_year}} {{car_make}} {{car_model}} ({{car_license_plate}}).</p>

<h3>Driver Information:</h3>
<ul>
  <li>Name: {{driver_name}}</li>
  <li>Email: {{driver_email}}</li>
  <li>Phone: {{driver_phone}}</li>
</ul>

<h3>Request Details:</h3>
<ul>
  <li>Start Date: {{start_date}}</li>
  <li>End Date: {{end_date}}</li>
  <li>Max Hours/Week: {{max_hours_per_week}}</li>
</ul>

<h3>Driver Notes:</h3>
<p>{{driver_notes}}</p>

<h3>Experience:</h3>
<p>{{experience_details}}</p>

<p><a href="https://mokumbi.com/drive-requests">View and Respond to Request</a></p>
```

### Weekly Report Template

Template ID: Set in `SENDGRID_WEEKLY_REPORT_TEMPLATE_ID`

**Dynamic Template Data:**
- `owner_name` - Car owner's name
- `driver_name` - Driver's name
- `car_make` - Car make
- `car_model` - Car model
- `car_year` - Car year
- `car_license_plate` - Car license plate
- `week_start` - Week start date
- `week_end` - Week end date
- `total_earnings` - Total earnings
- `fuel_expenses` - Fuel expenses
- `maintenance_expenses` - Maintenance expenses
- `other_expenses` - Other expenses
- `net_earnings` - Net earnings
- `total_distance` - Total distance
- `total_trips` - Total trips
- `notes` - Report notes
- `report_id` - Report ID

**Sample Template:**
```html
<p>Hello {{owner_name}},</p>

<p>A weekly report has been submitted for your {{car_year}} {{car_make}} {{car_model}} ({{car_license_plate}}) by {{driver_name}}.</p>

<h3>Week Summary:</h3>
<ul>
  <li>Period: {{week_start}} to {{week_end}}</li>
  <li>Total Earnings: ${{total_earnings}}</li>
  <li>Total Distance: {{total_distance}} km</li>
  <li>Total Trips: {{total_trips}}</li>
</ul>

<h3>Expenses:</h3>
<ul>
  <li>Fuel: ${{fuel_expenses}}</li>
  <li>Maintenance: ${{maintenance_expenses}}</li>
  <li>Other: ${{other_expenses}}</li>
</ul>

<h3>Net Earnings: ${{net_earnings}}</h3>

<h3>Notes:</h3>
<p>{{notes}}</p>

<p><a href="https://mokumbi.com/cars/{{car_id}}/reports">View Full Report</a></p>
```

## Testing

### Test Drive Request Email
```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer <anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "drive_request",
    "record": {
      "id": "<request-id>"
    }
  }'
```

### Test Weekly Report Email
```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer <anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "weekly_report_submitted",
    "record": {
      "id": "<report-id>"
    }
  }'
```

## Troubleshooting

### Check Edge Function Logs
```bash
supabase functions logs send-email
```

### Common Issues

1. **SendGrid API Key not set**: Ensure `SENDGRID_API_KEY` is configured
2. **Template not found**: Verify template IDs are correct in SendGrid
3. **Email not sending**: Check SendGrid dashboard for delivery status
4. **pg_net not enabled**: Run `CREATE EXTENSION IF NOT EXISTS pg_net;`
5. **Function URL not set**: Ensure edge function URL is configured in database settings

## Monitoring

Monitor email delivery in:
1. SendGrid Dashboard → Activity
2. Supabase Edge Functions → Logs
3. Database logs for trigger execution

## Security Notes

- The edge function uses the service role key for database access
- SendGrid API key should be kept secure and never exposed in client code
- RLS policies ensure only authorized data is accessible
- Email addresses are validated before sending
