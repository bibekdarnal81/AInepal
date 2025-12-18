-- Add features column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.projects.features IS 'List of project features/highlights';
