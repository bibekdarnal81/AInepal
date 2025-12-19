-- Create post_categories table
CREATE TABLE public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT post_categories_pkey PRIMARY KEY (id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS post_categories_slug_idx ON public.post_categories(slug);

-- Enable Row Level Security
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to post categories"
ON public.post_categories
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users (admin) full access
CREATE POLICY "Allow full access to authenticated users"
ON public.post_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add some default categories
INSERT INTO public.post_categories (name, slug, description, color, icon_name)
VALUES
  ('Technology', 'technology', 'Posts about technology trends and tutorials', '#3b82f6', 'Code'),
  ('Design', 'design', 'Design tips, UI/UX and creative inspiration', '#8b5cf6', 'Palette'),
  ('Business', 'business', 'Business insights and entrepreneurship', '#10b981', 'Briefcase'),
  ('Tutorial', 'tutorial', 'Step-by-step guides and how-tos', '#f59e0b', 'BookOpen'),
  ('News', 'news', 'Latest updates and announcements', '#ef4444', 'Newspaper')
ON CONFLICT (slug) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.post_categories IS 'Categories for organizing blog posts';
