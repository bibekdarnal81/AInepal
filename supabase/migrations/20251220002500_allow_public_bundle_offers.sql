-- Migration: allow public read access to active bundle offers
-- Timestamp: 20251220002500

-- Allow public access to read active offers
CREATE POLICY "Public can view active bundle offers"
    ON public.bundle_offers
    FOR SELECT
    TO anon, authenticated
    USING (is_active = true);
