-- Create the classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  description TEXT,
  level TEXT,
  duration TEXT,
  start_date DATE,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT classes_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Public read access for published classes
CREATE POLICY "Allow public read access to published classes"
ON public.classes
FOR SELECT
TO public
USING (is_published = true);

-- Authenticated users (admin) full access
CREATE POLICY "Allow full access to authenticated users on classes"
ON public.classes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Indexes
CREATE INDEX classes_slug_idx ON public.classes(slug);
CREATE INDEX classes_is_published_idx ON public.classes(is_published);
CREATE INDEX classes_is_featured_idx ON public.classes(is_featured);
CREATE INDEX classes_display_order_idx ON public.classes(display_order);
