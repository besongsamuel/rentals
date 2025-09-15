-- Create weekly_reports table
CREATE TABLE weekly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  start_mileage INTEGER NOT NULL,
  end_mileage INTEGER NOT NULL,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  driver_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  maintenance_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(car_id, week_start_date)
);

-- Enable RLS
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Drivers can view own reports" ON weekly_reports
  FOR SELECT USING (
    auth.uid() = driver_id OR 
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = weekly_reports.car_id 
      AND cars.owner_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can insert own reports" ON weekly_reports
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own reports" ON weekly_reports
  FOR UPDATE USING (
    auth.uid() = driver_id AND status = 'draft'
  );

CREATE POLICY "Owners can approve reports" ON weekly_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cars 
      WHERE cars.id = weekly_reports.car_id 
      AND cars.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_weekly_reports_car_id ON weekly_reports(car_id);
CREATE INDEX idx_weekly_reports_driver_id ON weekly_reports(driver_id);
CREATE INDEX idx_weekly_reports_week_start ON weekly_reports(week_start_date);
CREATE INDEX idx_weekly_reports_status ON weekly_reports(status);

-- Create trigger for updated_at
CREATE TRIGGER update_weekly_reports_updated_at BEFORE UPDATE ON weekly_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
