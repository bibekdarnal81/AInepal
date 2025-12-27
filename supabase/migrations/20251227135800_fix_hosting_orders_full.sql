-- Add all potentially missing columns to hosting_orders
ALTER TABLE hosting_orders
ADD COLUMN IF NOT EXISTS domain_name TEXT,
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id),
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
