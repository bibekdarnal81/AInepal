-- Add price_yearly column to hosting_plans table
ALTER TABLE hosting_plans 
ADD COLUMN IF NOT EXISTS price_yearly numeric DEFAULT 0;

-- Update existing rows to have a default yearly price (e.g. 10x monthly)
UPDATE hosting_plans 
SET price_yearly = price * 10
WHERE price_yearly = 0 OR price_yearly IS NULL;
