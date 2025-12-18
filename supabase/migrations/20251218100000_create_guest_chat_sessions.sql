-- Create guest_chat_sessions table for guest user information
CREATE TABLE IF NOT EXISTS public.guest_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  initial_question TEXT,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on session_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_guest_chat_sessions_token ON public.guest_chat_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_guest_chat_sessions_created_at ON public.guest_chat_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.guest_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all guest sessions
CREATE POLICY "Admins can view all guest sessions"
  ON public.guest_chat_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Anyone can create guest sessions (for anonymous users)
CREATE POLICY "Anyone can create guest sessions"
  ON public.guest_chat_sessions FOR INSERT
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_guest_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guest_chat_sessions_updated_at
  BEFORE UPDATE ON public.guest_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_chat_sessions_updated_at();
