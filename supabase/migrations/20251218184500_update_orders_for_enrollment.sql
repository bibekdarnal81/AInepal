-- Migration: Update orders table for enrollment details

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add comment explaining these fields
COMMENT ON COLUMN public.orders.mobile IS 'Contact number provided during enrollment';
COMMENT ON COLUMN public.orders.address IS 'Physical address provided during enrollment';
COMMENT ON COLUMN public.orders.college_name IS 'College/Institution name provided during enrollment';
