# SendGrid Email Templates

This directory contains the email templates for the mo kumbi rental application.

## Templates

### 1. Drive Request Notification (`drive-request.html`)

Sent to car owners when a driver submits a request to use their car.

**Dynamic Data:**

- `owner_name` - Car owner's full name
- `driver_name` - Driver's full name
- `driver_email` - Driver's email address
- `driver_phone` - Driver's phone number
- `car_make` - Car manufacturer
- `car_model` - Car model
- `car_year` - Car year
- `car_license_plate` - Car license plate number
- `start_date` - Availability start date
- `end_date` - Availability end date
- `max_hours_per_week` - Maximum hours per week
- `driver_notes` - Additional notes from driver
- `experience_details` - Driver's experience details
- `request_id` - Unique request identifier

### 2. Weekly Report Submitted (`weekly-report.html`)

Sent to car owners when a driver submits their weekly earnings report.

**Dynamic Data:**

- `owner_name` - Car owner's full name
- `driver_name` - Driver's full name
- `car_make` - Car manufacturer
- `car_model` - Car model
- `car_year` - Car year
- `car_license_plate` - Car license plate number
- `week_start` - Week start date
- `week_end` - Week end date
- `total_earnings` - Total earnings for the week
- `fuel_expenses` - Fuel expenses
- `maintenance_expenses` - Maintenance expenses
- `other_expenses` - Other expenses
- `net_earnings` - Net earnings (after expenses)
- `total_distance` - Total distance driven
- `total_trips` - Total number of trips
- `notes` - Additional notes from driver
- `report_id` - Unique report identifier

## Creating/Updating Templates in SendGrid

### Prerequisites

- SendGrid account with API access
- SendGrid API key with template creation permissions

### How It Works

The script intelligently handles both creating new templates and updating existing ones:

- **First Run**: Creates new templates in SendGrid
- **Subsequent Runs**: Detects existing templates and creates new versions (upsert behavior)
- **Version Management**: Automatically deactivates old versions and activates the new one
- **Version Naming**: Names versions with date stamps for easy tracking

### Steps

1. **Set your SendGrid API key as an environment variable:**

   ```bash
   export SENDGRID_API_KEY="your-sendgrid-api-key-here"
   ```

2. **Run the template creation/update script:**

   ```bash
   cd /Users/besongsamuel/Workspace/rentals/rentals-frontend
   node src/sendgrid/create-templates.js
   ```

   The script will:

   - Check if templates already exist
   - Create new templates OR add new versions to existing templates
   - Automatically activate the latest version
   - Display the template IDs

3. **Copy the template IDs from the output:**
   The script will output something like:

   ```
   SENDGRID_DRIVE_REQUEST_TEMPLATE_ID=d-xxxxxxxxxxxx
   SENDGRID_WEEKLY_REPORT_TEMPLATE_ID=d-xxxxxxxxxxxx
   ```

4. **Add the template IDs to your Supabase environment:**

   For local development:

   ```bash
   supabase secrets set SENDGRID_DRIVE_REQUEST_TEMPLATE_ID=d-xxxxxxxxxxxx
   supabase secrets set SENDGRID_WEEKLY_REPORT_TEMPLATE_ID=d-xxxxxxxxxxxx
   ```

   For production (via Supabase Dashboard):

   - Go to Project Settings > Edge Functions
   - Add the environment variables

5. **Template IDs are also saved to `template-ids.json`** for reference.

## Testing Templates

You can test the templates in SendGrid's dashboard:

1. Go to Email API > Dynamic Templates
2. Find your templates
3. Click on the template
4. Use the "Test Data" feature to preview with sample data

## Design Features

Both templates follow the mo kumbi brand guidelines:

- **Primary Color:** Green (#2e7d32) - Used for headers, CTAs, and positive values
- **Secondary Color:** Red (#d32f2f) - Used for expenses and warnings
- **Accent Color:** Yellow/Orange (#f57c00) - Used for highlights
- **Mobile-First:** Fully responsive design
- **Modern UI:** Clean, professional layout with proper spacing
- **Clear Hierarchy:** Easy-to-scan information layout
- **Action-Oriented:** Clear call-to-action buttons

## Modifying Templates

To modify the templates after making changes to the HTML:

1. Edit the HTML files in `templates/`
2. Run the script again: `node src/sendgrid/create-templates.js`
3. The script will create new versions of the existing templates
4. **No need to update environment variables** - template IDs remain the same!

The script automatically:

- Detects the existing templates by name
- Creates a new version with the updated HTML
- Deactivates the old version
- Activates the new version

## Template Syntax

The templates use Handlebars syntax for dynamic content:

- `{{variable_name}}` - Simple variable substitution
- `{{#if variable}}...{{/if}}` - Conditional sections

SendGrid automatically processes Handlebars syntax in dynamic templates.
