-- Migration: create bundle_offers table
-- Timestamp: 20251219210000
CREATE TABLE public.bundle_offers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    hosting_type text NOT NULL, -- e.g., shared, vps, dedicated, cloud
    price numeric NOT NULL,
    discount_percent integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS policies for bundle_offers (admin only)
CREATE POLICY "Admins can read bundle offers"
    ON public.bundle_offers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can insert bundle offers"
    ON public.bundle_offers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update bundle offers"
    ON public.bundle_offers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete bundle offers"
    ON public.bundle_offers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );
