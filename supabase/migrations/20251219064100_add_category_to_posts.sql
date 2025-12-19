-- Add category_id column to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.post_categories(id) ON DELETE SET NULL;

-- Rename thumbnail_url to featured_image_url for clarity
ALTER TABLE public.posts
RENAME COLUMN thumbnail_url TO featured_image_url;

-- Create index for faster category lookups
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON public.posts(category_id);

-- Add comments
COMMENT ON COLUMN public.posts.category_id IS 'Foreign key to post_categories table';
COMMENT ON COLUMN public.posts.featured_image_url IS 'URL of the featured/hero image for the post';
