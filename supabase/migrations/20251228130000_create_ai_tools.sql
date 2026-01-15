-- Create the ai_tools table
CREATE TABLE public.ai_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_tools_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active tools
CREATE POLICY "Allow public read access to active ai tools"
ON public.ai_tools
FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users (admin) full access
CREATE POLICY "Allow full access to authenticated users for ai tools"
ON public.ai_tools
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Indexes for faster queries
CREATE INDEX ai_tools_category_idx ON public.ai_tools(category);
CREATE INDEX ai_tools_is_active_idx ON public.ai_tools(is_active);
CREATE INDEX ai_tools_display_order_idx ON public.ai_tools(display_order);

-- Seed default AI tools
INSERT INTO public.ai_tools (name, description, icon, category, is_active, display_order) VALUES
('AI Chat Assistant', 'Robust conversation engine', 'MessageSquare', 'Chat', true, 1),
('Code Generator', 'Debug, refactor, and write code', 'Code2', 'Code', true, 2),
('Image Generator', 'Text-to-Image creation', 'Image', 'Design', true, 3),
('Content Writer', 'SEO-optimized blog posts', 'PenLine', 'Content', true, 4),
('Resume Builder', 'ATS-friendly formats', 'FileText', 'Career', true, 5),
('Email Writer', 'Professional templates', 'Mail', 'Communication', true, 6),
('Document Summarizer', 'PDF and text analysis', 'FileSearch', 'Productivity', true, 7),
('SQL Query Architect', 'Natural Language to SQL', 'Database', 'Data', true, 8),
('OCR / Image to Text', 'Extract text from images', 'Scan', 'Productivity', true, 9),
('Language Translator', 'Support for 15+ languages', 'Languages', 'Language', true, 10),
('Website Builder', 'Text to Website', 'LayoutTemplate', 'Web', true, 11),
('Story Weaver', 'Creative fiction writing', 'BookOpen', 'Creative', true, 12),
('Personal Finance', 'Expense tracking & advice', 'Wallet', 'Finance', true, 13),
('Grammar Guardian', 'Advanced proofreading', 'CheckCircle2', 'Content', true, 14),
('Interview Coach', 'Mock interview simulations', 'Users', 'Career', true, 15),
('Meeting Minutes', 'Transcript & summary', 'ClipboardList', 'Productivity', true, 16),
('Quiz Master', 'Generate quizzes from text', 'ListChecks', 'Education', true, 17),
('Smart Recipe', 'Cook with what you have', 'ChefHat', 'Lifestyle', true, 18),
('Social Media Post', 'Viral content generation', 'Share2', 'Social', true, 19),
('Sentiment Analyst', 'Analyze tone & emotion', 'Activity', 'Analytics', true, 20);
