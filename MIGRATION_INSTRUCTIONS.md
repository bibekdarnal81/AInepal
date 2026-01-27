# Database Migration Instructions

## Quick Setup (Recommended)

Run these commands in your terminal to apply the migrations:

```bash
cd /Users/aasish/Project/site/AINepal

# Option 1: Using Supabase CLI (if installed)
supabase db push

# Option 2: Using npx (no installation needed)
npx supabase db push
```

## Manual Setup (via Supabase Dashboard)

If the CLI doesn't work, apply migrations manually in Supabase Dashboard:

### Step 1: Create Guest Chat Sessions Table

Go to SQL Editor in Supabase Dashboard and run:

```sql
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
```

### Step 2: Update Chat Messages Table

Run this in SQL Editor:

```sql
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
```

## Verification

After running migrations, verify the tables exist:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('guest_chat_sessions', 'chat_messages');

-- Check guest_chat_sessions structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'guest_chat_sessions';

-- Check chat_messages has new column
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND column_name IN ('user_id', 'guest_session_id');
```

## Troubleshooting

If you get errors about existing policies, drop them first:

```sql
-- Drop existing policies if needed
DROP POLICY IF EXISTS "Guest users can view own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Guest users can insert own chat messages" ON public.chat_messages;
```

After migrations are applied, try the guest chat form again!
