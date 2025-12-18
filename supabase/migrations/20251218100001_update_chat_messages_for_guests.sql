-- Modify chat_messages table to support guest users
-- Make user_id nullable
ALTER TABLE public.chat_messages ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_session_id column
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS guest_session_id UUID REFERENCES public.guest_chat_sessions(id) ON DELETE CASCADE;

-- Add check constraint: either user_id or guest_session_id must be set
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_user_or_guest_check 
  CHECK (
    (user_id IS NOT NULL AND guest_session_id IS NULL) OR
    (user_id IS NULL AND guest_session_id IS NOT NULL)
  );

-- Create index on guest_session_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_guest_session_id ON public.chat_messages(guest_session_id);

-- Add policy for guest users to view their own messages
CREATE POLICY "Guest users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (guest_session_id IS NOT NULL);

-- Add policy for guest users to insert their own messages
CREATE POLICY "Guest users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (guest_session_id IS NOT NULL AND is_admin = false);

-- Update admin policies to include guest messages
DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
CREATE POLICY "Admins can view all chat messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
