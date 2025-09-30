# Updated Database Schema for mo kumbi App

## Overview

This schema supports a car rental/ride-share tracking application with two user types: **drivers** and **owners**. The schema has been updated to use a normalized approach with a separate table for income sources instead of JSONB.

## Organizations Table

**Status**: Removed - The organizations table and organization_id column have been dropped from the schema to simplify the application structure.

## Updated Tables

### 1. `car_makes` (Car Manufacturers)

```sql
CREATE TABLE car_makes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  founded_year INTEGER,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Normalized table for car manufacturers (Toyota, Ford, BMW, etc.)
**Features**: Includes country, founding year, and logo URL for rich manufacturer data

### 2. `car_models` (Car Models)

```sql
CREATE TABLE car_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make_id UUID REFERENCES car_makes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  year_start INTEGER,
  year_end INTEGER,
  body_type TEXT, -- sedan, SUV, hatchback, etc.
  fuel_type TEXT, -- gasoline, diesel, electric, hybrid
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(make_id, name, year_start)
);
```

**Purpose**: Normalized table for car models linked to manufacturers
**Features**: Includes production years, body type, and fuel type for comprehensive vehicle data

### 3. `profiles` (Extended User Profiles)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('driver', 'owner')),
  phone TEXT,
  referred_by TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores user profile information including referral tracking
**Features**:

- Links directly to Supabase auth users
- Supports both driver and owner user types
- Optional referral tracking via `referred_by` field

### 4. `cars`

```sql
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT,
  initial_mileage INTEGER NOT NULL DEFAULT 0,
  current_mileage INTEGER NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Main owner of the car
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
  fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric')),
  transmission_type TEXT CHECK (transmission_type IN ('manual', 'automatic')),
  is_available BOOLEAN NOT NULL DEFAULT true, -- When true, car is publicly visible to all authenticated users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores car information with public visibility control
**Features**:

- `is_available` flag controls whether authenticated users can view the car
- When `is_available = true`, any authenticated user can see the car details
- Owners and assigned drivers can always view the car regardless of `is_available` status

### 5. `car_owners` (Additional car owners)

```sql
CREATE TABLE car_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, owner_id)
);
```

**Note**: The main owner is tracked in `cars.owner_id`. This table tracks additional owners for multi-owner cars. All owners have equal rights.

### 6. `weekly_reports` (Updated - removed income_sources JSONB)

```sql
CREATE TABLE weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  start_mileage INTEGER NOT NULL,
  end_mileage INTEGER NOT NULL,
  driver_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  maintenance_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
  gas_expense DECIMAL(10,2) NOT NULL DEFAULT 0,
  ride_share_income DECIMAL(10,2) NOT NULL DEFAULT 0,
  rental_income DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'XAF',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, week_start_date)
);
```

### 7. `income_sources` (New table)

```sql
CREATE TABLE income_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rentals', 'ride_share')),
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. `comments`

```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9. `car_assignments` (Enhanced - Historical tracking with contract termination)

```sql
CREATE TABLE car_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES profiles(id) NOT NULL,
  notes TEXT,
  -- Contract termination fields
  contract_start_date DATE,
  contract_end_date DATE,
  termination_reason TEXT CHECK (termination_reason IN (
    'contract_completed',
    'mutual_agreement',
    'owner_terminated',
    'driver_terminated',
    'violation_of_terms',
    'other'
  )),
  termination_notes TEXT,
  terminated_by UUID REFERENCES profiles(id),
  terminated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  rating_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Tracks car assignments with enhanced contract termination support
**Features**:

- Historical tracking of all car assignments
- Contract start and end date tracking
- Termination reason and notes
- Rating requirement flags
- Active status management

### 10. `driver_details` (Driver Extended Details)

```sql
CREATE TABLE driver_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Personal Information
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  nationality TEXT,
  languages TEXT[], -- Array of languages spoken
  -- Contact Information
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  address TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Cameroon',
  -- Driver License Information
  license_number TEXT UNIQUE,
  license_issue_date DATE,
  license_expiry_date DATE,
  license_class TEXT, -- A, B, C, etc.
  license_issuing_authority TEXT,
  -- Professional Information
  years_of_experience INTEGER DEFAULT 0,
  preferred_transmission TEXT CHECK (preferred_transmission IN ('manual', 'automatic', 'both')),
  -- Availability
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_break')),
  preferred_working_hours JSONB, -- {"start": "08:00", "end": "18:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]}
  -- Preferences
  communication_preference TEXT DEFAULT 'phone' CHECK (communication_preference IN ('phone', 'email', 'sms', 'whatsapp')),
  -- ID Card Information (NEW)
  id_card_type TEXT CHECK (id_card_type IN ('passport', 'national_id', 'residency_card', 'drivers_license', 'military_id', 'student_id', 'other')),
  id_card_number TEXT,
  id_card_expiry_date DATE,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores extended driver information including personal, contact, license, professional, and ID card details.
**Features**:

- Links to user profiles
- Comprehensive driver data for better selection and management
- Optional ID card information for verification

### 11. `driver_ratings` (Enhanced - Driver Performance Ratings)

```sql
CREATE TABLE driver_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rater_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- Usually car owner
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories JSONB, -- {"punctuality": 5, "communication": 4, "vehicle_care": 5, "safety": 5}
  -- Enhanced fields for contract termination
  car_assignment_id UUID REFERENCES car_assignments(id) ON DELETE CASCADE,
  rating_type TEXT DEFAULT 'contract_completion' CHECK (rating_type IN (
    'contract_completion',
    'ongoing_performance',
    'other'
  )),
  would_recommend BOOLEAN,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores driver performance ratings and feedback from car owners with contract termination support.
**Features**:

- Links to specific car assignments
- Multiple rating types (contract completion, ongoing performance)
- Recommendation tracking
- Anonymous rating option

### 12. `contract_terminations` (NEW - Contract Termination Audit Trail)

```sql
CREATE TABLE contract_terminations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_assignment_id UUID REFERENCES car_assignments(id) ON DELETE CASCADE NOT NULL,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Termination details
  termination_date DATE NOT NULL,
  termination_reason TEXT NOT NULL CHECK (termination_reason IN (
    'contract_completed',
    'mutual_agreement',
    'owner_terminated',
    'driver_terminated',
    'violation_of_terms',
    'other'
  )),
  termination_notes TEXT,
  initiated_by UUID REFERENCES profiles(id) NOT NULL,
  -- Contract summary
  total_weeks_worked INTEGER,
  total_reports_submitted INTEGER,
  total_earnings DECIMAL(10,2),
  final_mileage INTEGER,
  -- Rating status
  rating_provided BOOLEAN DEFAULT false,
  rating_provided_at TIMESTAMP WITH TIME ZONE,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_assignment_id)
);
```

**Purpose**: Comprehensive audit trail for contract terminations and performance summaries.
**Features**:

- Complete contract lifecycle tracking
- Performance metrics (weeks worked, reports, earnings)
- Rating requirement tracking
- Termination reason categorization

## Database Functions

### Contract Termination Functions

#### `terminate_contract(car_assignment_id, termination_reason, termination_notes, terminated_by)`

Terminates a contract and creates a termination record with performance summary.

**Parameters:**

- `car_assignment_id`: UUID of the car assignment to terminate
- `termination_reason`: Reason for termination (contract_completed, mutual_agreement, etc.)
- `termination_notes`: Optional notes about the termination
- `terminated_by`: UUID of user initiating termination (defaults to auth.uid())

**Returns:** Boolean indicating success

**Actions:**

- Updates car assignment with termination details
- Sets car status to 'available' and removes driver assignment
- Creates contract termination record with performance metrics
- Sets rating_required flag to true

#### `mark_rating_provided(car_assignment_id, rating_id)`

Marks a rating as provided and updates termination record.

**Parameters:**

- `car_assignment_id`: UUID of the car assignment
- `rating_id`: UUID of the rating record

**Returns:** Boolean indicating success

#### `get_driver_average_rating(driver_id)`

Calculates average ratings for a driver across all categories.

**Parameters:**

- `driver_id`: UUID of the driver

**Returns:** Table with overall_avg, total_ratings, recommendation_rate, category_avgs

#### `get_pending_ratings(owner_id)`

Gets all pending ratings for an owner (terminated contracts without ratings).

**Parameters:**

- `owner_id`: UUID of the car owner

**Returns:** Table with termination details and driver/car information

## Row Level Security (RLS) Policies

### Enable RLS on all tables

```sql
ALTER TABLE car_makes ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_assignments ENABLE ROW LEVEL SECURITY;
```

### Car Makes and Models Policies

```sql
-- Car Makes Policies (Read-Only)
CREATE POLICY "Anyone can view car makes" ON car_makes
  FOR SELECT TO authenticated
  USING (true);

-- Car Models Policies (Read-Only)
CREATE POLICY "Anyone can view car models" ON car_models
  FOR SELECT TO authenticated
  USING (true);
```

**Note**: Insert and Update policies for car makes and models will be added in a future migration for admin users.

### Car Owners Policies

```sql
-- Car owners can view car ownership
CREATE POLICY "Car owners can view car ownership" ON car_owners
  FOR SELECT USING (
    -- Allow any authenticated user to view car ownership records
    auth.uid() IS NOT NULL
  );

-- Car owners can view ownership for their cars
CREATE POLICY "Car owners can view ownership for their cars" ON car_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND (
        -- Main owner of the car (cars.owner_id)
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = car_owners.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Additional car owner (already in car_owners table)
        car_owners.owner_id = auth.uid()
      )
    )
  );
```

### Weekly Reports Policies

```sql
-- Drivers can view their weekly reports
CREATE POLICY "Drivers can view their weekly reports" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND weekly_reports.driver_id = auth.uid()
    )
  );

-- Owners can view weekly reports for cars they own
CREATE POLICY "Owners can view weekly reports for cars they own" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND (
        -- Main owner of the car (cars.owner_id)
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = weekly_reports.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Additional car owner (car_owners table)
        EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = weekly_reports.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );

-- Drivers can insert their own reports
CREATE POLICY "Drivers can insert their own reports" ON weekly_reports
  FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

-- Drivers can update their own draft reports
CREATE POLICY "Drivers can update their own draft reports" ON weekly_reports
  FOR UPDATE TO authenticated
  USING (
    driver_id = auth.uid()
    AND status = 'draft'
  );

-- Car owners can approve/reject reports
CREATE POLICY "Car owners can approve/reject reports" ON weekly_reports
  FOR UPDATE TO authenticated
  USING (
    -- Allow if user is the main owner of the car
    EXISTS (
      SELECT 1 FROM cars
      WHERE cars.id = weekly_reports.car_id
      AND cars.owner_id = auth.uid()
    )
    OR
    -- Allow if user is an additional owner of the car
    EXISTS (
      SELECT 1 FROM car_owners
      WHERE car_owners.car_id = weekly_reports.car_id
      AND car_owners.owner_id = auth.uid()
    )
  );
```

### Income Sources Policies

```sql
-- Users can view income sources for reports they have access to
CREATE POLICY "Users can view accessible income sources" ON income_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      JOIN cars c ON c.id = wr.car_id
      WHERE wr.id = income_sources.weekly_report_id
      AND (c.owner_id = auth.uid() OR wr.driver_id = auth.uid())
    )
  );

-- Drivers can insert income sources for their reports
CREATE POLICY "Drivers can insert income sources" ON income_sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = income_sources.weekly_report_id
      AND wr.driver_id = auth.uid()
    )
  );

-- Drivers can update income sources for their draft reports
CREATE POLICY "Drivers can update income sources" ON income_sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = income_sources.weekly_report_id
      AND wr.driver_id = auth.uid()
      AND wr.status = 'draft'
    )
  );

-- Drivers can delete income sources for their draft reports
CREATE POLICY "Drivers can delete income sources" ON income_sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = income_sources.weekly_report_id
      AND wr.driver_id = auth.uid()
      AND wr.status = 'draft'
    )
  );
```

## Updated Sample Queries

### Get all car makes with their models

```sql
SELECT
  cm.name as make_name,
  cm.country,
  cm.founded_year,
  COUNT(cmod.id) as model_count
FROM car_makes cm
LEFT JOIN car_models cmod ON cm.id = cmod.make_id
WHERE cm.is_active = true
GROUP BY cm.id, cm.name, cm.country, cm.founded_year
ORDER BY cm.name;
```

### Get all models for a specific make

```sql
SELECT
  cmod.name as model_name,
  cmod.year_start,
  cmod.year_end,
  cmod.body_type,
  cmod.fuel_type
FROM car_models cmod
JOIN car_makes cm ON cmod.make_id = cm.id
WHERE cm.name = 'Toyota' AND cmod.is_active = true
ORDER BY cmod.name, cmod.year_start;
```

### Get all SUVs from German manufacturers

```sql
SELECT
  cm.name as make_name,
  cmod.name as model_name,
  cmod.year_start,
  cmod.year_end
FROM car_models cmod
JOIN car_makes cm ON cmod.make_id = cm.id
WHERE cm.country = 'Germany'
  AND cmod.body_type = 'SUV'
  AND cmod.is_active = true
ORDER BY cm.name, cmod.name;
```

### Get all electric vehicles

```sql
SELECT
  cm.name as make_name,
  cmod.name as model_name,
  cmod.year_start,
  cmod.year_end,
  cmod.body_type
FROM car_models cmod
JOIN car_makes cm ON cmod.make_id = cm.id
WHERE cmod.fuel_type = 'electric'
  AND cmod.is_active = true
ORDER BY cm.name, cmod.name;
```

### Get cars by fuel type

```sql
SELECT
  c.vin,
  c.make,
  c.model,
  c.year,
  c.fuel_type,
  c.transmission_type,
  p.full_name as owner_name
FROM cars c
LEFT JOIN profiles p ON c.owner_id = p.id
WHERE c.fuel_type = 'electric'
ORDER BY c.make, c.model;
```

### Get cars by transmission type

```sql
SELECT
  c.vin,
  c.make,
  c.model,
  c.year,
  c.fuel_type,
  c.transmission_type,
  p.full_name as owner_name
FROM cars c
LEFT JOIN profiles p ON c.owner_id = p.id
WHERE c.transmission_type = 'manual'
ORDER BY c.make, c.model;
```

### Get hybrid and electric cars with automatic transmission

```sql
SELECT
  c.vin,
  c.make,
  c.model,
  c.year,
  c.fuel_type,
  c.transmission_type,
  p.full_name as owner_name
FROM cars c
LEFT JOIN profiles p ON c.owner_id = p.id
WHERE c.fuel_type IN ('hybrid', 'electric')
  AND c.transmission_type = 'automatic'
ORDER BY c.fuel_type, c.make, c.model;
```

### Get driver dashboard data with income sources

```sql
SELECT
  c.vin,
  c.make,
  c.model,
  c.year,
  c.current_mileage,
  wr.week_start_date,
  wr.driver_earnings,
  wr.maintenance_expenses,
  wr.gas_expense,
  wr.ride_share_income,
  wr.rental_income,
  wr.currency
FROM cars c
LEFT JOIN weekly_reports wr ON c.id = wr.car_id
WHERE c.driver_id = auth.uid()
ORDER BY wr.week_start_date DESC;
```

### Get owner dashboard data with income sources

```sql
SELECT
  c.id,
  c.vin,
  c.make,
  c.model,
  c.year,
  p.full_name as driver_name,
  wr.week_start_date,
  wr.driver_earnings,
  wr.maintenance_expenses,
  wr.gas_expense,
  wr.ride_share_income,
  wr.rental_income,
  wr.currency,
  wr.status
FROM cars c
LEFT JOIN profiles p ON c.driver_id = p.id
LEFT JOIN weekly_reports wr ON c.id = wr.car_id
WHERE c.owner_id = auth.uid()
   OR EXISTS (
     SELECT 1 FROM car_owners co
     WHERE co.car_id = c.id
     AND co.owner_id = auth.uid()
   )
ORDER BY c.id, wr.week_start_date DESC;
```

## Benefits of Normalized Approach

1. **Better Data Integrity**: Enforced relationships and constraints
2. **Easier Querying**: Standard SQL joins instead of JSONB operations
3. **Better Performance**: Indexed columns for faster queries
4. **Type Safety**: Proper data types for amounts and source types
5. **Extensibility**: Easy to add new income source types
6. **Reporting**: Simpler aggregation and analysis queries

## Row Level Security (RLS) Policies

### Weekly Reports Policies

#### Drivers can view their own reports

```sql
CREATE POLICY "Drivers can view their own reports" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND weekly_reports.driver_id = auth.uid()
    )
  );
```

#### Drivers can update their own reports (any status)

```sql
CREATE POLICY "Drivers can update their own reports" ON weekly_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'driver'
      AND weekly_reports.driver_id = auth.uid()
    )
  );
```

#### Owners can view reports for cars they own

```sql
CREATE POLICY "Owners can view weekly reports for cars they own" ON weekly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND (
        -- Main owner of the car (cars.owner_id)
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = weekly_reports.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Additional car owner (car_owners table)
        EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = weekly_reports.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );
```

### Car Owners Policies

#### Authenticated users can view car ownership

```sql
CREATE POLICY "Authenticated users can view car ownership" ON car_owners
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);
```

#### Car owners can view ownership for their cars

```sql
CREATE POLICY "Car owners can view ownership for their cars" ON car_owners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.user_type = 'owner'
      AND car_owners.owner_id = auth.uid()
    )
  );
```

### Car Makes and Models Policies

#### Anyone can view car makes

```sql
CREATE POLICY "Anyone can view car makes" ON car_makes
  FOR SELECT TO authenticated
  USING (true);
```

#### Anyone can view car models

```sql
CREATE POLICY "Anyone can view car models" ON car_models
  FOR SELECT TO authenticated
  USING (true);
```

## Messages Table

### 8. `messages` (Comments for Weekly Reports)

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID NOT NULL REFERENCES weekly_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Stores comments and replies for weekly reports, allowing drivers and owners to communicate about specific reports.

**Key Features**:

- **Hierarchical Structure**: Supports nested replies through `parent_message_id`
- **Content Validation**: Ensures messages are between 1-2000 characters
- **Automatic Timestamps**: Tracks creation and update times
- **Cascade Deletion**: Messages are deleted when reports or users are deleted

**Indexes**:

```sql
CREATE INDEX idx_messages_weekly_report_id ON messages(weekly_report_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**RLS Policies**:

#### Users can view messages for accessible weekly reports

```sql
CREATE POLICY "Users can view messages for accessible weekly reports" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = messages.weekly_report_id
      AND (
        -- Driver can see messages for their own reports
        (wr.driver_id = auth.uid())
        OR
        -- Owner can see messages for reports of cars they own
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = wr.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Car owners can see messages for reports of cars they co-own
        EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = wr.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );
```

#### Users can insert messages for accessible weekly reports

```sql
CREATE POLICY "Users can insert messages for accessible weekly reports" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = messages.weekly_report_id
      AND (
        -- Driver can add messages to their own reports
        (wr.driver_id = auth.uid())
        OR
        -- Owner can add messages to reports of cars they own
        EXISTS (
          SELECT 1 FROM cars c
          WHERE c.id = wr.car_id
          AND c.owner_id = auth.uid()
        )
        OR
        -- Car owners can add messages to reports of cars they co-own
        EXISTS (
          SELECT 1 FROM car_owners co
          WHERE co.car_id = wr.car_id
          AND co.owner_id = auth.uid()
        )
      )
    )
  );
```

#### Users can update their own messages

```sql
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### Users can delete their own messages

```sql
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (user_id = auth.uid());
```
