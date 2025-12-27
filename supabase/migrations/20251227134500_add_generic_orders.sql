-- Add price to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'NPR';

-- Create service_orders table
CREATE TABLE IF NOT EXISTS service_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    service_id UUID REFERENCES services(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
    requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create project_orders table (for buying templates/scripts based on projects)
CREATE TABLE IF NOT EXISTS project_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    project_id UUID REFERENCES projects(id),
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create domain_orders table (for domain registration requests)
CREATE TABLE IF NOT EXISTS domain_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    domain_name VARCHAR(255) NOT NULL,
    years INT DEFAULT 1,
    payment_method_id UUID REFERENCES payment_methods(id),
    amount DECIMAL(10, 2) NOT NULL,
    transaction_id VARCHAR(255),
    payment_proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_orders ENABLE ROW LEVEL SECURITY;

-- Service Orders Policies
CREATE POLICY "Users can view their own service orders" ON service_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service orders" ON service_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all service orders" ON service_orders
    FOR SELECT USING (auth.email() = 'admin@rusha.com'); -- Or use generic admin check if user_metadata is reliable

-- Project Orders Policies
CREATE POLICY "Users can view their own project orders" ON project_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project orders" ON project_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all project orders" ON project_orders
    FOR SELECT USING (auth.email() = 'admin@rusha.com');

-- Domain Orders Policies
CREATE POLICY "Users can view their own domain orders" ON domain_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domain orders" ON domain_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all domain orders" ON domain_orders
    FOR SELECT USING (auth.email() = 'admin@rusha.com');

-- Check and add amount to hosting_orders if missing
ALTER TABLE hosting_orders ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0;

