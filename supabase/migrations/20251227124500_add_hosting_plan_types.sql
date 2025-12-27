-- Add type column to hosting_plans table
ALTER TABLE hosting_plans 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'shared';

-- Update existing rows to have 'shared' type if null
UPDATE hosting_plans 
SET type = 'shared' 
WHERE type IS NULL;

-- Add check constraint to ensure only valid types
ALTER TABLE hosting_plans 
ADD CONSTRAINT hosting_plans_type_check 
CHECK (type IN ('shared', 'vps', 'dedicated'));
