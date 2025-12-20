-- Migration: update bundle_items to support multiple item types
-- Timestamp: 20251219214000

-- Modify bundle_items table
ALTER TABLE public.bundle_items
    ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS domain_id uuid REFERENCES public.domains(id) ON DELETE CASCADE;

-- Make existing columns nullable
ALTER TABLE public.bundle_items
    ALTER COLUMN hosting_plan_id DROP NOT NULL,
    ALTER COLUMN domain_tld DROP NOT NULL;

-- Add check constraint to ensure at least one target is set
-- First drop if exists to avoid errors on rerun
ALTER TABLE public.bundle_items DROP CONSTRAINT IF EXISTS bundle_items_target_check;

ALTER TABLE public.bundle_items
    ADD CONSTRAINT bundle_items_target_check
    CHECK (
        num_nonnulls(hosting_plan_id, project_id, service_id, domain_id, domain_tld) > 0
    );
