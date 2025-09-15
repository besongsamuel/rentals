-- Create car_assignments table
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

-- Enable RLS
ALTER TABLE car_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view relevant assignments" ON car_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_assignments.car_id
      AND (c.owner_id = auth.uid() OR c.driver_id = auth.uid())
    )
  );

CREATE POLICY "Owners can assign cars" ON car_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_assignments.car_id
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update assignments" ON car_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cars c
      WHERE c.id = car_assignments.car_id
      AND c.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_car_assignments_car_id ON car_assignments(car_id);
CREATE INDEX idx_car_assignments_driver_id ON car_assignments(driver_id);
CREATE INDEX idx_car_assignments_assigned_by ON car_assignments(assigned_by);
