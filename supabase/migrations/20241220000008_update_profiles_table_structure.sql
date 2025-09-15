-- Update profiles table structure
-- Change from using auth.users.id as primary key to having its own id
-- Add user_id as foreign key reference to auth.users

-- First, drop existing constraints and policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop all foreign key constraints that reference profiles table
ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_owner_id_fkey;
ALTER TABLE cars DROP CONSTRAINT IF EXISTS cars_driver_id_fkey;
ALTER TABLE weekly_reports DROP CONSTRAINT IF EXISTS weekly_reports_driver_id_fkey;
ALTER TABLE weekly_reports DROP CONSTRAINT IF EXISTS weekly_reports_approved_by_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE car_assignments DROP CONSTRAINT IF EXISTS car_assignments_driver_id_fkey;
ALTER TABLE car_assignments DROP CONSTRAINT IF EXISTS car_assignments_assigned_by_fkey;

-- Drop the existing primary key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Add new columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing records to set user_id = current id (which was the auth user id)
UPDATE profiles SET user_id = id WHERE user_id IS NULL;

-- Make user_id NOT NULL and add foreign key constraint
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id unique to ensure one profile per user
ALTER TABLE profiles ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Drop the old id column
ALTER TABLE profiles DROP COLUMN id;

-- Rename new_id to id
ALTER TABLE profiles RENAME COLUMN new_id TO id;

-- Make id the primary key
ALTER TABLE profiles ADD PRIMARY KEY (id);

-- Recreate RLS policies with new structure
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Only authenticated users can insert profiles
CREATE POLICY "Authenticated users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Recreate the updated_at trigger
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Update any existing foreign key references in other tables
-- Note: This assumes other tables reference profiles by the old id (which was auth user id)
-- We need to update those references to use the new id

-- Update cars table if it references profiles
DO $$
BEGIN
  -- Check if cars table exists and has owner_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'cars' AND column_name = 'owner_id') THEN
    
    -- Update cars.owner_id to reference the new profiles.id
    UPDATE cars 
    SET owner_id = p.id 
    FROM profiles p 
    WHERE cars.owner_id = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE cars ADD CONSTRAINT cars_owner_id_fkey 
      FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Check if cars table exists and has driver_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'cars' AND column_name = 'driver_id') THEN
    
    -- Update cars.driver_id to reference the new profiles.id
    UPDATE cars 
    SET driver_id = p.id 
    FROM profiles p 
    WHERE cars.driver_id = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE cars ADD CONSTRAINT cars_driver_id_fkey 
      FOREIGN KEY (driver_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update weekly_reports table if it references profiles
DO $$
BEGIN
  -- Check if weekly_reports table exists and has driver_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'weekly_reports' AND column_name = 'driver_id') THEN
    
    -- Update weekly_reports.driver_id to reference the new profiles.id
    UPDATE weekly_reports 
    SET driver_id = p.id 
    FROM profiles p 
    WHERE weekly_reports.driver_id = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE weekly_reports ADD CONSTRAINT weekly_reports_driver_id_fkey 
      FOREIGN KEY (driver_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Check if weekly_reports table exists and has approved_by column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'weekly_reports' AND column_name = 'approved_by') THEN
    
    -- Update weekly_reports.approved_by to reference the new profiles.id
    UPDATE weekly_reports 
    SET approved_by = p.id 
    FROM profiles p 
    WHERE weekly_reports.approved_by = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE weekly_reports ADD CONSTRAINT weekly_reports_approved_by_fkey 
      FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update comments table if it references profiles
DO $$
BEGIN
  -- Check if comments table exists and has author_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'comments' AND column_name = 'author_id') THEN
    
    -- Update comments.author_id to reference the new profiles.id
    UPDATE comments 
    SET author_id = p.id 
    FROM profiles p 
    WHERE comments.author_id = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE comments ADD CONSTRAINT comments_author_id_fkey 
      FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update car_assignments table if it references profiles
DO $$
BEGIN
  -- Check if car_assignments table exists and has driver_id column
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'car_assignments' AND column_name = 'driver_id') THEN
    
    -- Update car_assignments.driver_id to reference the new profiles.id
    UPDATE car_assignments 
    SET driver_id = p.id 
    FROM profiles p 
    WHERE car_assignments.driver_id = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE car_assignments ADD CONSTRAINT car_assignments_driver_id_fkey 
      FOREIGN KEY (driver_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  -- Also update assigned_by column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'car_assignments' AND column_name = 'assigned_by') THEN
    
    -- Update car_assignments.assigned_by to reference the new profiles.id
    UPDATE car_assignments 
    SET assigned_by = p.id 
    FROM profiles p 
    WHERE car_assignments.assigned_by = p.user_id;
    
    -- Recreate foreign key constraint
    ALTER TABLE car_assignments ADD CONSTRAINT car_assignments_assigned_by_fkey 
      FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add comment explaining the migration
COMMENT ON TABLE profiles IS 'User profiles with separate ID and user_id reference to auth.users';
COMMENT ON COLUMN profiles.id IS 'Primary key for profiles table';
COMMENT ON COLUMN profiles.user_id IS 'Foreign key reference to auth.users(id)';
