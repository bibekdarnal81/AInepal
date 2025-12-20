-- Migration: create bundle_items table
-- Timestamp: 20251219211000
CREATE TABLE public.bundle_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id uuid NOT NULL REFERENCES public.bundle_offers(id) ON DELETE CASCADE,
    hosting_plan_id uuid NOT NULL REFERENCES public.hosting_plans(id),
    domain_tld text NOT NULL -- e.g., .com, .net
);

-- RLS policies for bundle_items (admin only)
CREATE POLICY "Admins can read bundle items"
    ON public.bundle_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can insert bundle items"
    ON public.bundle_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update bundle items"
    ON public.bundle_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete bundle items"
    ON public.bundle_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_admin = true
        )
    );
