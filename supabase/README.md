# Supabase Database Migrations

This directory contains database migrations for the 3 Brothers Rentals application. The migrations create a normalized schema for tracking car rentals and ride-share earnings.

## Migration Files

The migrations are numbered sequentially and should be applied in order:

1. `20241220000001_create_profiles_table.sql` - Creates user profiles table
2. `20241220000002_create_cars_table.sql` - Creates cars table
3. `20241220000003_create_weekly_reports_table.sql` - Creates weekly reports table
4. `20241220000004_create_income_sources_table.sql` - Creates income sources table (normalized)
5. `20241220000005_create_comments_table.sql` - Creates comments table
6. `20241220000006_create_car_assignments_table.sql` - Creates car assignments table
7. `20241220000007_create_triggers_and_functions.sql` - Creates database functions and triggers

## Prerequisites

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
2. Create a Supabase project
3. Link your local project to Supabase

## Setup Instructions

### 1. Initialize Supabase (if not already done)

```bash
# Initialize Supabase in your project
supabase init

# Login to Supabase
supabase login

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

### 2. Apply Migrations

#### Option A: Apply all migrations at once

```bash
# Push all migrations to your remote Supabase project
supabase db push
```

#### Option B: Apply migrations individually

```bash
# Apply a specific migration
supabase migration up --file 20241220000001_create_profiles_table.sql

# Or apply all pending migrations
supabase migration up
```

#### Option C: Apply to local development database

```bash
# Start local Supabase
supabase start

# Apply migrations locally
supabase db reset
```

### 3. Verify Migration Status

```bash
# Check migration status
supabase migration list

# Check which migrations are pending
supabase migration list --status pending
```

## Database Schema Overview

### Tables Created

1. **profiles** - Extended user profiles with driver/owner types
2. **cars** - Car information including VIN, make/model, mileage
3. **weekly_reports** - Weekly earnings and expense reports
4. **income_sources** - Normalized income sources (rentals, ride-share)
5. **comments** - Comments and replies on weekly reports
6. **car_assignments** - Historical tracking of car assignments

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **Proper foreign key relationships** with cascade deletes
- **Automatic triggers** for updating timestamps and calculations
- **Data validation** with CHECK constraints
- **Performance indexes** on frequently queried columns

### Security Policies

- Users can only see their own data
- Drivers can only modify their own reports (when in draft status)
- Owners can view and approve reports for their cars
- Comments are only visible to relevant parties

## Sample Data

After applying migrations, you can insert sample data:

```sql
-- Insert sample profiles
INSERT INTO profiles (id, email, full_name, user_type) VALUES
  (auth.uid(), 'owner@example.com', 'John Owner', 'owner'),
  (gen_random_uuid(), 'driver@example.com', 'Jane Driver', 'driver');

-- Insert sample car
INSERT INTO cars (vin, make, model, year, owner_id) VALUES
  ('1HGBH41JXMN109186', 'Honda', 'Civic', 2020, auth.uid());
```

## Useful Commands

### Development Workflow

```bash
# Start local development
supabase start

# Reset local database and apply all migrations
supabase db reset

# Generate TypeScript types from schema
supabase gen types typescript --local > src/types/database.ts

# Stop local development
supabase stop
```

### Production Deployment

```bash
# Deploy to production
supabase db push

# Generate types for production
supabase gen types typescript --project-ref your-project-ref > src/types/database.ts
```

### Troubleshooting

```bash
# Check database status
supabase status

# View logs
supabase logs

# Repair migration history (if needed)
supabase migration repair
```

## Schema Benefits

### Normalized Income Sources

Instead of using JSONB for income sources, the schema uses a separate `income_sources` table with:

- **Better performance** - Indexed columns instead of JSONB queries
- **Type safety** - Proper data types and constraints
- **Easier reporting** - Standard SQL aggregations
- **Data integrity** - Foreign key relationships

### Automatic Calculations

Triggers automatically:

- Update car mileage when reports are approved
- Calculate total earnings from income sources
- Update car status when assignments change
- Maintain updated_at timestamps

### Security

Row Level Security policies ensure:

- Users only see their own data
- Drivers can only edit draft reports
- Owners can approve reports for their cars
- Comments are properly scoped

## Next Steps

1. Apply the migrations to your Supabase project
2. Set up authentication in your frontend
3. Create API functions for common operations
4. Implement the frontend components
5. Add data validation and error handling

For more information, see the [Supabase CLI documentation](https://supabase.com/docs/reference/cli/supabase-migration).
