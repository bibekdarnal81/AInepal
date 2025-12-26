-- Add subcategory field to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- Create index on subcategory for faster filtering
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON services(subcategory);
