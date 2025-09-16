# Updated Database Schema for 3 Brothers Rentals App

## Overview

This schema supports a car rental/ride-share tracking application with two user types: **drivers** and **owners**. The schema has been updated to use a normalized approach with a separate table for income sources instead of JSONB.

## Organizations Table

```sql
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Multi-tenant support for different rental companies
**Seed Data**: "3 Brother Rentals" organization is automatically created with ID `550e8400-e29b-41d4-a716-446655440000`

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
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE SET NULL DEFAULT '550e8400-e29b-41d4-a716-446655440000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. `car_owners` (Additional owners and ownership percentages)

```sql
CREATE TABLE car_owners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ownership_percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (ownership_percentage > 0 AND ownership_percentage <= 100),
  is_primary_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, owner_id)
);
```

**Note**: The main owner is tracked in `cars.owner_id`. This table tracks additional owners and their ownership percentages.

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

### 9. `car_assignments` (Historical tracking)

```sql
CREATE TABLE car_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES profiles(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

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

### Weekly Reports Policies

```sql
-- Users can view relevant weekly reports
CREATE POLICY "Users can view relevant weekly reports" ON weekly_reports
  FOR SELECT TO authenticated
  USING (
    -- Allow if user is the driver who created the report
    driver_id = auth.uid()
    OR
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
