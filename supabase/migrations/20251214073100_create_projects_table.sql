-- Create the projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  thumbnail_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to published projects
CREATE POLICY "Allow public read access to published projects"
ON public.projects
FOR SELECT
TO public
USING (is_published = true);

-- Create a policy to allow authenticated users (admin) to do everything
CREATE POLICY "Allow full access to authenticated users"
ON public.projects
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX projects_slug_idx ON public.projects(slug);
CREATE INDEX projects_is_published_idx ON public.projects(is_published);
CREATE INDEX projects_is_featured_idx ON public.projects(is_featured);
CREATE INDEX projects_category_idx ON public.projects(category);
