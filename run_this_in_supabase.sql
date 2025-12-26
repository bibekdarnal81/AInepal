-- ============================================
-- PORTFOLIOS TABLE CREATION
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- Drop existing table if you need to recreate it
-- DROP TABLE IF EXISTS portfolios CASCADE;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    client_name TEXT,
    category TEXT,
    technologies TEXT[] DEFAULT '{}',
    project_url TEXT,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_published ON portfolios(is_published);
CREATE INDEX IF NOT EXISTS idx_portfolios_display_order ON portfolios(display_order);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if recreating
DROP POLICY IF EXISTS "Allow public read access to published portfolios" ON portfolios;
DROP POLICY IF EXISTS "Allow authenticated users to view all portfolios" ON portfolios;
DROP POLICY IF EXISTS "Allow authenticated users to insert portfolios" ON portfolios;
DROP POLICY IF EXISTS "Allow authenticated users to update portfolios" ON portfolios;
DROP POLICY IF EXISTS "Allow authenticated users to delete portfolios" ON portfolios;

-- Create policies
CREATE POLICY "Allow public read access to published portfolios"
ON portfolios FOR SELECT
USING (is_published = true);

CREATE POLICY "Allow authenticated users to view all portfolios"
ON portfolios FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert portfolios"
ON portfolios FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update portfolios"
ON portfolios FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete portfolios"
ON portfolios FOR DELETE
TO authenticated
USING (true);

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;

-- Create the trigger
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Portfolios table created successfully!' as status;
