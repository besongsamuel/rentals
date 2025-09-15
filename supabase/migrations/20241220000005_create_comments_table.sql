-- Create comments table
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

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view accessible comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      JOIN cars c ON c.id = wr.car_id
      WHERE wr.id = comments.weekly_report_id
      AND (c.owner_id = auth.uid() OR wr.driver_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM weekly_reports wr
      JOIN cars c ON c.id = wr.car_id
      WHERE wr.id = comments.weekly_report_id
      AND (c.owner_id = auth.uid() OR wr.driver_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Create indexes
CREATE INDEX idx_comments_weekly_report_id ON comments(weekly_report_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);

-- Create trigger for updated_at
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
