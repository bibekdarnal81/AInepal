-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    type text NOT NULL CHECK (type IN ('esewa', 'khalti', 'bank_transfer', 'other')),
    qr_image_url text,
    account_name text,
    account_number text,
    bank_name text,
    instructions text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add payment fields to hosting_orders
ALTER TABLE hosting_orders 
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES payment_methods(id),
ADD COLUMN IF NOT EXISTS payment_proof_url text,
ADD COLUMN IF NOT EXISTS transaction_id text;

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policies for payment_methods
CREATE POLICY "Public read access for active payment methods" 
ON payment_methods FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin full access for payment methods" 
ON payment_methods FOR ALL 
USING (auth.jwt() ->> 'email' = 'admin@antuf.org'); -- Using email based admin check for simplicity as seen in typical patterns here, or adjust to role based if available

-- Note: Ensure storage buckets 'payment-proofs' and 'qr-codes' exist in Supabase Dashboard
