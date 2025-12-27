-- Add amount column to hosting_orders if it doesn't exist
ALTER TABLE hosting_orders 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload config';
