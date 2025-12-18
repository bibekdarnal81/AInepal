-- Create project_categories table
CREATE TABLE IF NOT EXISTS public.project_categories (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    color TEXT DEFAULT '#3B82F6',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT project_categories_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for project_categories
CREATE POLICY "Allow public read access to categories"
ON public.project_categories
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users full access to categories"
ON public.project_categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add category_id column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.project_categories(id) ON DELETE SET NULL;

-- Create index for category_id
CREATE INDEX IF NOT EXISTS projects_category_id_idx ON public.projects(category_id);

-- Insert default categories
INSERT INTO public.project_categories (name, slug, description, icon_name, color, display_order) VALUES
('Web Development', 'web-development', 'Web applications and websites', 'Globe', '#3B82F6', 1),
('Mobile App', 'mobile-app', 'iOS, Android, and cross-platform mobile applications', 'Smartphone', '#8B5CF6', 2),
('E-commerce', 'e-commerce', 'Online stores and shopping platforms', 'ShoppingCart', '#10B981', 3),
('Portfolio', 'portfolio', 'Personal and business portfolio websites', 'Briefcase', '#F59E0B', 4),
('Blog/CMS', 'blog-cms', 'Content management systems and blogging platforms', 'FileText', '#EF4444', 5),
('Dashboard', 'dashboard', 'Admin panels and analytics dashboards', 'LayoutDashboard', '#6366F1', 6),
('API/Backend', 'api-backend', 'Backend services and APIs', 'Server', '#14B8A6', 7),
('Other', 'other', 'Uncategorized projects', 'Box', '#6B7280', 8)
ON CONFLICT (slug) DO NOTHING;

-- Migrate existing category text data to category_id
-- This attempts to match existing text categories to new category slugs
DO $$
DECLARE
    cat RECORD;
BEGIN
    FOR cat IN SELECT id, slug FROM public.project_categories
    LOOP
        UPDATE public.projects
        SET category_id = cat.id
        WHERE LOWER(category) LIKE '%' || REPLACE(cat.slug, '-', '%') || '%'
        AND category_id IS NULL;
    END LOOP;
END $$;

-- Optional: Set 'Other' category for projects without a category
UPDATE public.projects
SET category_id = (SELECT id FROM public.project_categories WHERE slug = 'other')
WHERE category_id IS NULL;
