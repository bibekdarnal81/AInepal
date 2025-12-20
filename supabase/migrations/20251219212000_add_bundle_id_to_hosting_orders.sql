-- Migration: add bundle_id to hosting_orders
-- Timestamp: 20251219212000
ALTER TABLE public.hosting_orders
ADD COLUMN bundle_id uuid REFERENCES public.bundle_offers(id) ON DELETE SET NULL;

-- Optional: index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hosting_orders_bundle_id ON public.hosting_orders(bundle_id);
