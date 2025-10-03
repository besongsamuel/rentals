# Email Notifications Setup

## Overview

Implemented automated email notifications using Supabase Edge Functions and SendGrid for:
1. **Drive Requests** - Notify car owners when drivers request to drive their cars
2. **Weekly Reports** - Notify car owners when weekly reports are submitted

## Architecture

```
Database Trigger → Edge Function → SendGrid → Email Delivered
```

### Flow:
1. **Database Event** (INSERT/UPDATE) triggers a database function
2. **Database Function** calls the Edge Function via HTTP (pg_net)
3. **Edge Function** fetches related data and formats email
4. **SendGrid API** sends email using dynamic templates
5. **Email** delivered to recipient

## Files Created

### 1. Edge Function
**Path**: `supabase/functions/send-email/index.ts`
- Handles email sending logic
- Integrates with SendGrid API
- Supports multiple email types
- Fetches related data from database
- Uses dynamic templates

### 2. Database Migration
**Path**: `supabase/migrations/20250930190000_setup_email_notifications.sql`
- Creates trigger functions
- Sets up database triggers
- Configures async HTTP calls

### 3. Documentation
**Path**: `supabase/functions/send-email/README.md`
- Complete setup instructions
- Environment variable configuration
- SendGrid template examples
- Testing procedures
- Troubleshooting guide

## Email Types

### 1. Drive Request Email
**Trigger**: New record inserted into `car_assignment_requests` with status='pending'

**Recipient**: Car owner

**Template Data**:
- Owner name
- Driver information (name, email, phone)
- Car details (make, model, year, license plate)
- Request details (dates, hours, notes)
- Driver experience details

**Purpose**: Notify owners of new driver requests so they can review and respond

### 2. Weekly Report Submitted Email
**Trigger**: Record updated in `weekly_reports` with status changing to 'submitted'

**Recipient**: Car owner

**Template Data**:
- Owner name
- Driver name
- Car details
- Week period
- Earnings summary
- Expenses breakdown
- Net earnings
- Distance and trips
- Notes

**Purpose**: Keep owners informed of weekly performance and earnings

## Setup Checklist

### Prerequisites
- [ ] Supabase project set up
- [ ] SendGrid account created
- [ ] Sender email verified in SendGrid
- [ ] Email templates created in SendGrid

### Configuration Steps

#### 1. Enable pg_net Extension
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

#### 2. Set Environment Variables
```bash
supabase secrets set SENDGRID_API_KEY=your_key_here
supabase secrets set SENDGRID_FROM_EMAIL=noreply@mokumbi.com
supabase secrets set SENDGRID_DRIVE_REQUEST_TEMPLATE_ID=d-xxxxx
supabase secrets set SENDGRID_WEEKLY_REPORT_TEMPLATE_ID=d-xxxxx
```

#### 3. Configure Database Settings
```sql
ALTER DATABASE postgres SET app.settings.edge_function_url = 
  'https://<project-ref>.supabase.co/functions/v1/send-email';
ALTER DATABASE postgres SET app.settings.service_role_key = 
  '<your-service-role-key>';
```

#### 4. Deploy Edge Function
```bash
supabase functions deploy send-email
```

#### 5. Apply Migration
```bash
supabase db push
```

## SendGrid Template Requirements

### Drive Request Template
Create a template in SendGrid with ID stored in `SENDGRID_DRIVE_REQUEST_TEMPLATE_ID`

**Required Variables**:
- `{{owner_name}}`
- `{{driver_name}}`
- `{{driver_email}}`
- `{{driver_phone}}`
- `{{car_make}}`, `{{car_model}}`, `{{car_year}}`
- `{{car_license_plate}}`
- `{{start_date}}`, `{{end_date}}`
- `{{max_hours_per_week}}`
- `{{driver_notes}}`
- `{{experience_details}}`
- `{{request_id}}`

### Weekly Report Template
Create a template in SendGrid with ID stored in `SENDGRID_WEEKLY_REPORT_TEMPLATE_ID`

**Required Variables**:
- `{{owner_name}}`
- `{{driver_name}}`
- `{{car_make}}`, `{{car_model}}`, `{{car_year}}`
- `{{car_license_plate}}`
- `{{week_start}}`, `{{week_end}}`
- `{{total_earnings}}`
- `{{fuel_expenses}}`
- `{{maintenance_expenses}}`
- `{{other_expenses}}`
- `{{net_earnings}}`
- `{{total_distance}}`
- `{{total_trips}}`
- `{{notes}}`
- `{{report_id}}`

## Testing

### Manual Testing via cURL
```bash
# Test drive request email
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer <anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{"type":"drive_request","record":{"id":"<request-id>"}}'

# Test weekly report email
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer <anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{"type":"weekly_report_submitted","record":{"id":"<report-id>"}}'
```

### Monitor Delivery
1. **SendGrid Dashboard** → Activity → View delivery status
2. **Supabase Logs** → Edge Functions → View function logs
3. **Database Logs** → Check trigger execution

## Security Considerations

✅ **Service Role Key**: Used for database access, stored securely in database settings
✅ **SendGrid API Key**: Stored as secret, never exposed to client
✅ **RLS Policies**: Ensure only authorized data is accessed
✅ **Email Validation**: Recipient emails validated before sending
✅ **CORS Headers**: Configured for security
✅ **Error Handling**: Comprehensive error catching and logging

## Troubleshooting

### Email Not Sending
1. Check SendGrid API key is set correctly
2. Verify template IDs are correct
3. Ensure sender email is verified in SendGrid
4. Check edge function logs for errors

### Trigger Not Firing
1. Verify pg_net extension is enabled
2. Check database settings for edge function URL
3. Ensure service role key is configured
4. Review database logs for trigger execution

### Template Errors
1. Verify all required variables are in template
2. Check template ID matches environment variable
3. Test template in SendGrid's template editor

## Monitoring & Maintenance

### Regular Checks
- Monitor SendGrid delivery rates
- Review edge function error logs
- Check database trigger performance
- Verify email bounce rates

### Scaling Considerations
- SendGrid has rate limits (check your plan)
- Edge functions have execution time limits
- Consider email queue for high volume
- Monitor database trigger performance

## Future Enhancements

Potential additions:
- [ ] Email preferences (user can opt-out)
- [ ] Batch email sending for multiple reports
- [ ] Email templates for other events (approvals, rejections)
- [ ] SMS notifications integration
- [ ] Email analytics and tracking
- [ ] Scheduled digest emails (daily/weekly summaries)

---

**Setup Date**: September 30, 2025
**Status**: ✅ Ready for Configuration and Testing
