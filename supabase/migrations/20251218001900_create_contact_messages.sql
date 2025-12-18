-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    phone TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to insert contact messages
CREATE POLICY "Allow public to submit contact messages"
ON public.contact_messages
FOR INSERT
TO public
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

-- Create indexes for faster queries
CREATE INDEX contact_messages_created_at_idx ON public.contact_messages(created_at DESC);
CREATE INDEX contact_messages_is_read_idx ON public.contact_messages(is_read);
CREATE INDEX contact_messages_email_idx ON public.contact_messages(email);
