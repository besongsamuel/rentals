-- Create income_sources table
CREATE TABLE income_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID REFERENCES weekly_reports(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rentals', 'ride_share')),
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE income_sources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view accessible income sources" ON income_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      JOIN cars c ON c.id = wr.car_id
      WHERE wr.id = income_sources.weekly_report_id
      AND (c.owner_id = auth.uid() OR wr.driver_id = auth.uid())
    )
  );

CREATE POLICY "Drivers can insert income sources" ON income_sources
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = income_sources.weekly_report_id
      AND wr.driver_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can update income sources" ON income_sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = income_sources.weekly_report_id
      AND wr.driver_id = auth.uid()
      AND wr.status = 'draft'
    )
  );

CREATE POLICY "Drivers can delete income sources" ON income_sources
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      WHERE wr.id = income_sources.weekly_report_id
      AND wr.driver_id = auth.uid()
      AND wr.status = 'draft'
    )
  );

-- Create indexes
CREATE INDEX idx_income_sources_weekly_report_id ON income_sources(weekly_report_id);
CREATE INDEX idx_income_sources_source_type ON income_sources(source_type);

-- Create trigger for updated_at
CREATE TRIGGER update_income_sources_updated_at BEFORE UPDATE ON income_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
