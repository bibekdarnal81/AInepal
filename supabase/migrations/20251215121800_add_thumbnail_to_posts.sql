-- Add thumbnail_url and excerpt columns to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS posts_thumbnail_url_idx ON public.posts(thumbnail_url);
