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

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);

-- Create index on is_published for published portfolios query
CREATE INDEX IF NOT EXISTS idx_portfolios_is_published ON portfolios(is_published);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_portfolios_display_order ON portfolios(display_order);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to published portfolios
CREATE POLICY "Allow public read access to published portfolios"
ON portfolios FOR SELECT
USING (is_published = true);

-- Create policy to allow authenticated users to view all portfolios
CREATE POLICY "Allow authenticated users to view all portfolios"
ON portfolios FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert portfolios
CREATE POLICY "Allow authenticated users to insert portfolios"
ON portfolios FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update portfolios
CREATE POLICY "Allow authenticated users to update portfolios"
ON portfolios FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete portfolios
CREATE POLICY "Allow authenticated users to delete portfolios"
ON portfolios FOR DELETE
TO authenticated
USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
