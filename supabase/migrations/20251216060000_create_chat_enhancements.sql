-- Create chat_attachments table for image uploads
CREATE TABLE IF NOT EXISTS chat_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_inquiries table
CREATE TABLE IF NOT EXISTS payment_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  inquiry_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'pending',
  chat_message_id UUID REFERENCES chat_messages(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_payment_inquiries_user_id ON payment_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_inquiries_status ON payment_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_payment_inquiries_chat_message_id ON payment_inquiries(chat_message_id);

-- Add RLS policies for chat_attachments
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat attachments"
  ON chat_attachments FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM chat_messages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own chat attachments"
  ON chat_attachments FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM chat_messages WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for payment_inquiries
ALTER TABLE payment_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment inquiries"
  ON payment_inquiries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payment inquiries"
  ON payment_inquiries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment inquiries"
  ON payment_inquiries FOR UPDATE
  USING (user_id = auth.uid());
