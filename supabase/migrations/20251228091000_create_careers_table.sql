-- Create the careers table
CREATE TABLE public.careers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  employment_type TEXT,
  department TEXT,
  experience TEXT,
  description TEXT,
  requirements TEXT,
  apply_url TEXT,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT careers_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

-- Public read access for published roles
CREATE POLICY "Allow public read access to published careers"
ON public.careers
FOR SELECT
TO public
USING (is_published = true);

-- Authenticated users (admin) full access
CREATE POLICY "Allow full access to authenticated users on careers"
ON public.careers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Indexes
CREATE INDEX careers_slug_idx ON public.careers(slug);
CREATE INDEX careers_is_published_idx ON public.careers(is_published);
CREATE INDEX careers_display_order_idx ON public.careers(display_order);
