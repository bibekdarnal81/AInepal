-- Create class_orders table
CREATE TABLE IF NOT EXISTS class_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    class_id UUID REFERENCES classes(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    full_name TEXT,
    email TEXT,
    mobile TEXT,
    address TEXT,
    college_name TEXT,
    other_course TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE class_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own class orders" ON class_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own class orders" ON class_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all class orders" ON class_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update all class orders" ON class_orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE INDEX IF NOT EXISTS class_orders_user_id_idx ON class_orders(user_id);
CREATE INDEX IF NOT EXISTS class_orders_class_id_idx ON class_orders(class_id);
CREATE INDEX IF NOT EXISTS class_orders_status_idx ON class_orders(status);
