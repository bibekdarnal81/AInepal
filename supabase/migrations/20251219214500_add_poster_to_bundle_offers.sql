-- Migration: add poster_url to bundle_offers
-- Timestamp: 20251219214500

ALTER TABLE public.bundle_offers
    ADD COLUMN IF NOT EXISTS poster_url text;
