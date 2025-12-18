-- Create the courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  duration_hours INTEGER,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  instructor_name TEXT,
  instructor_avatar TEXT,
  lessons_count INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access to published courses
CREATE POLICY "Allow public read access to published courses"
ON public.courses
FOR SELECT
TO public
USING (is_published = true);

-- Create a policy to allow authenticated users (admin) to do everything
CREATE POLICY "Allow full access to authenticated users"
ON public.courses
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX courses_slug_idx ON public.courses(slug);
CREATE INDEX courses_is_published_idx ON public.courses(is_published);
CREATE INDEX courses_is_featured_idx ON public.courses(is_featured);
