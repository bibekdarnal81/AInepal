-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- This fixes the RLS policies for contact_messages table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated users to read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated users to update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Allow authenticated users to delete contact messages" ON public.contact_messages;

-- Recreate policy to allow anyone (including anonymous) to insert contact messages
CREATE POLICY "Allow public to submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create a policy to allow authenticated users (admin) to read all messages
CREATE POLICY "Allow authenticated users to read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (true);

-- Create a policy to allow authenticated users (admin) to update messages
CREATE POLICY "Allow authenticated users to update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a policy to allow authenticated users (admin) to delete messages
CREATE POLICY "Allow authenticated users to delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
