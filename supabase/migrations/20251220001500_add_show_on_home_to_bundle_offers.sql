-- Migration: add show_on_home to bundle_offers
-- Timestamp: 20251220001500

ALTER TABLE public.bundle_offers
ADD COLUMN IF NOT EXISTS show_on_home boolean DEFAULT false;
