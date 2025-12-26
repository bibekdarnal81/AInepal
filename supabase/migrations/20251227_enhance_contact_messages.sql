-- Add new columns for the enhanced contact form
ALTER TABLE public.contact_messages 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS budget TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[], -- Array of strings
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS contact_method TEXT; -- 'email' or 'phone'

-- Update the indexes if needed (or just generic index on created_at is fine)
