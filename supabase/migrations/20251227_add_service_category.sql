-- Add category field to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
