-- Create bundle_orders table
CREATE TABLE IF NOT EXISTS bundle_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    bundle_id UUID REFERENCES bundle_offers(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE bundle_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own bundle orders" ON bundle_orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own bundle orders" ON bundle_orders 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bundle orders" ON bundle_orders
FOR SELECT USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
);

-- Notify
NOTIFY pgrst, 'reload config';
