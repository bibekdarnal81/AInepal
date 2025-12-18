-- Create the services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  icon_name TEXT,
  thumbnail_url TEXT,
  features TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to published services
CREATE POLICY "Allow public read access to published services"
ON public.services
FOR SELECT
TO public
USING (is_published = true);

-- Create a policy to allow authenticated users (admin) to do everything
CREATE POLICY "Allow full access to authenticated users"
ON public.services
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create indexes for faster queries
CREATE INDEX services_slug_idx ON public.services(slug);
CREATE INDEX services_is_published_idx ON public.services(is_published);
CREATE INDEX services_is_featured_idx ON public.services(is_featured);
CREATE INDEX services_display_order_idx ON public.services(display_order);
