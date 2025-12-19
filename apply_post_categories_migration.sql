-- Combined migration file for post categories feature
-- Run this in your Supabase SQL Editor

-- STEP 1: Create post_categories table
CREATE TABLE IF NOT EXISTS public.post_categories (
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
DROP POLICY IF EXISTS "Allow public read access to post categories" ON public.post_categories;
CREATE POLICY "Allow public read access to post categories"
ON public.post_categories
FOR SELECT
TO public
USING (true);

-- Create policy to allow authenticated users (admin) full access
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.post_categories;
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

-- STEP 2: Add category_id column to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.post_categories(id) ON DELETE SET NULL;

-- Rename thumbnail_url to featured_image_url for clarity (if not already renamed)
DO $$ 
BEGIN
    IF EXISTS(
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'posts' 
        AND column_name = 'thumbnail_url'
    ) THEN
        ALTER TABLE public.posts RENAME COLUMN thumbnail_url TO featured_image_url;
    END IF;
END $$;

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON public.posts(category_id);

-- Add comments
COMMENT ON COLUMN public.posts.category_id IS 'Foreign key to post_categories table';
COMMENT ON COLUMN public.posts.featured_image_url IS 'URL of the featured/hero image for the post';

-- DONE! 
-- You can now use the enhanced blog post system with categories and featured images.
