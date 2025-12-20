-- Migration: add bundle_id to domains
-- Timestamp: 20251219213000
ALTER TABLE public.domains
ADD COLUMN bundle_id uuid REFERENCES public.bundle_offers(id) ON DELETE SET NULL;

-- Optional: index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domains_bundle_id ON public.domains(bundle_id);
