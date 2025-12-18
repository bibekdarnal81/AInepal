-- Add price and currency columns to projects table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'price') THEN
        ALTER TABLE public.projects ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'currency') THEN
        ALTER TABLE public.projects ADD COLUMN currency TEXT DEFAULT 'NPR';
    END IF;
END $$;

-- Update ALL projects to have a default price of 15,000 NPR
UPDATE public.projects SET price = 15000 WHERE price = 0 OR price IS NULL;
UPDATE public.projects SET currency = 'NPR';

-- Update Services and Courses to use NPR
UPDATE public.services SET currency = 'NPR';
UPDATE public.courses SET currency = 'NPR';

-- Optional: Update defaults if they are 0 to generic starting prices
UPDATE public.services SET price = 2000 WHERE price = 0;
UPDATE public.courses SET price = 5000 WHERE price = 0;
