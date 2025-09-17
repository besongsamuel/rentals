-- Create messages table for weekly report comments
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  weekly_report_id UUID NOT NULL REFERENCES weekly_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_weekly_report_id ON messages(weekly_report_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages

-- Users can view all messages for weekly reports they have access to
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

-- Users can insert messages for weekly reports they have access to
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

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (user_id = auth.uid());

-- Add comments to the table and columns
COMMENT ON TABLE messages IS 'Messages/comments for weekly reports';
COMMENT ON COLUMN messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN messages.weekly_report_id IS 'Reference to the weekly report this message belongs to';
COMMENT ON COLUMN messages.user_id IS 'Reference to the user who created this message';
COMMENT ON COLUMN messages.parent_message_id IS 'Reference to parent message for replies (NULL for top-level messages)';
COMMENT ON COLUMN messages.content IS 'The message content (1-2000 characters)';
COMMENT ON COLUMN messages.created_at IS 'When the message was created';
COMMENT ON COLUMN messages.updated_at IS 'When the message was last updated';
