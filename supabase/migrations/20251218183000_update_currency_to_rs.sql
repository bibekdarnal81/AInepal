-- Migration: Update currency to Rs and set as default
-- 1. Update existing records in available tables
UPDATE public.courses SET currency = 'Rs' WHERE currency = 'USD' OR currency IS NULL;
UPDATE public.orders SET currency = 'Rs' WHERE currency = 'USD' OR currency IS NULL;

-- 2. Update services table if it has a currency column (checking just in case)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'currency') THEN
        UPDATE public.services SET currency = 'Rs' WHERE currency = 'USD' OR currency IS NULL;
        ALTER TABLE public.services ALTER COLUMN currency SET DEFAULT 'Rs';
    END IF;
END $$;

-- 3. Change default values for future records
ALTER TABLE public.courses ALTER COLUMN currency SET DEFAULT 'Rs';
ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'Rs';
