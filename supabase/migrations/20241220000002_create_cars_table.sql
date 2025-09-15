-- Create cars table
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
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Owners can view own cars" ON cars
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() = driver_id
  );

CREATE POLICY "Owners can insert cars" ON cars
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own cars" ON cars
  FOR UPDATE USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX idx_cars_owner_id ON cars(owner_id);
CREATE INDEX idx_cars_driver_id ON cars(driver_id);
CREATE INDEX idx_cars_vin ON cars(vin);
CREATE INDEX idx_cars_status ON cars(status);

-- Create trigger for updated_at
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
