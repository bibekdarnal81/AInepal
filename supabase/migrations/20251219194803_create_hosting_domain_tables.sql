-- Migration: Create hosting and domain registration tables
-- Created: 2025-12-19

-- Create hosting_plans table
CREATE TABLE IF NOT EXISTS public.hosting_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  storage_gb INTEGER NOT NULL,
  bandwidth_text TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NPR',
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT hosting_plans_pkey PRIMARY KEY (id)
);

-- Create domains table
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL UNIQUE,
  tld TEXT NOT NULL,
  registrar TEXT DEFAULT 'Dunzo',
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT domains_pkey PRIMARY KEY (id)
);

-- Create hosting_orders table
CREATE TABLE IF NOT EXISTS public.hosting_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.hosting_plans(id) ON DELETE CASCADE,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT hosting_orders_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.hosting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hosting_plans (public read, admin write)
CREATE POLICY "Allow public read access to active plans"
ON public.hosting_plans
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Allow admin full access to hosting plans"
ON public.hosting_plans
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- RLS Policies for domains (users can manage their own)
CREATE POLICY "Users can read their own domains"
ON public.domains
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own domains"
ON public.domains
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all domains"
ON public.domains
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- RLS Policies for hosting_orders (users can manage their own)
CREATE POLICY "Users can read their own hosting orders"
ON public.hosting_orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own hosting orders"
ON public.hosting_orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all hosting orders"
ON public.hosting_orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS hosting_plans_slug_idx ON public.hosting_plans(slug);
CREATE INDEX IF NOT EXISTS domains_user_id_idx ON public.domains(user_id);
CREATE INDEX IF NOT EXISTS domains_domain_name_idx ON public.domains(domain_name);
CREATE INDEX IF NOT EXISTS domains_status_idx ON public.domains(status);
CREATE INDEX IF NOT EXISTS hosting_orders_user_id_idx ON public.hosting_orders(user_id);
CREATE INDEX IF NOT EXISTS hosting_orders_plan_id_idx ON public.hosting_orders(plan_id);
CREATE INDEX IF NOT EXISTS hosting_orders_status_idx ON public.hosting_orders(status);

-- Insert default hosting plans
INSERT INTO public.hosting_plans (name, slug, storage_gb, bandwidth_text, price, features) VALUES
('Starter', 'starter', 10, '100 GB', 500, '["1 Website", "Free SSL Certificate", "24/7 Support", "Daily Backups"]'),
('Professional', 'professional', 50, 'Unlimited', 1500, '["10 Websites", "Free SSL Certificate", "Priority Support", "Daily Backups", "Free Domain (1 year)"]'),
('Business', 'business', 200, 'Unlimited', 3000, '["Unlimited Websites", "Free SSL Certificate", "VIP Support", "Hourly Backups", "Free Domain (1 year)", "CDN Integration"]')
ON CONFLICT (slug) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.hosting_plans IS 'Web hosting plans and pricing';
COMMENT ON TABLE public.domains IS 'Registered domains managed by users';
COMMENT ON TABLE public.hosting_orders IS 'User hosting subscriptions and orders';
