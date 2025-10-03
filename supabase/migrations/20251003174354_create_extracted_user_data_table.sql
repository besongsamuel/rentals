-- Create extracted_user_data table for storing AI extracted data
CREATE TABLE IF NOT EXISTS extracted_user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('drivers_license', 'car_image')),
  extracted_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id and type to ensure one record per user per type
CREATE UNIQUE INDEX IF NOT EXISTS idx_extracted_user_data_user_type 
ON extracted_user_data(user_id, type);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_extracted_user_data_user_id 
ON extracted_user_data(user_id);

-- Create index on type for faster queries
CREATE INDEX IF NOT EXISTS idx_extracted_user_data_type 
ON extracted_user_data(type);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_extracted_user_data_created_at 
ON extracted_user_data(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_extracted_user_data_updated_at 
BEFORE UPDATE ON extracted_user_data 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE extracted_user_data ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own extracted data
CREATE POLICY "Users can view their own extracted data" ON extracted_user_data
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own extracted data
CREATE POLICY "Users can insert their own extracted data" ON extracted_user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own extracted data
CREATE POLICY "Users can update their own extracted data" ON extracted_user_data
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own extracted data
CREATE POLICY "Users can delete their own extracted data" ON extracted_user_data
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE extracted_user_data IS 'Stores AI extracted data for users (driver licenses, car images, etc.)';
COMMENT ON COLUMN extracted_user_data.user_id IS 'Reference to the user who owns this extracted data';
COMMENT ON COLUMN extracted_user_data.type IS 'Type of extracted data (drivers_license, car_image, etc.)';
COMMENT ON COLUMN extracted_user_data.extracted_data IS 'JSON data containing the extracted information';
COMMENT ON COLUMN extracted_user_data.created_at IS 'When the extracted data was first created';
COMMENT ON COLUMN extracted_user_data.updated_at IS 'When the extracted data was last updated';
