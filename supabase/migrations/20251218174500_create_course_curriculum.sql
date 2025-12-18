-- Create course_sections table
CREATE TABLE IF NOT EXISTS public.course_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT course_sections_pkey PRIMARY KEY (id)
);

-- Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    duration_minutes INTEGER,
    video_url TEXT,
    is_free BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT course_lessons_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_sections
CREATE POLICY "Allow public read access to sections of published courses"
ON public.course_sections
FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = course_sections.course_id
        AND courses.is_published = true
    )
);

CREATE POLICY "Allow authenticated users full access to sections"
ON public.course_sections
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for course_lessons
CREATE POLICY "Allow public read access to lessons of published courses"
ON public.course_lessons
FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.course_sections
        JOIN public.courses ON courses.id = course_sections.course_id
        WHERE course_sections.id = course_lessons.section_id
        AND courses.is_published = true
    )
);

CREATE POLICY "Allow authenticated users full access to lessons"
ON public.course_lessons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX course_sections_course_id_idx ON public.course_sections(course_id);
CREATE INDEX course_sections_order_idx ON public.course_sections(order_index);
CREATE INDEX course_lessons_section_id_idx ON public.course_lessons(section_id);
CREATE INDEX course_lessons_order_idx ON public.course_lessons(order_index);

-- Add comments
COMMENT ON TABLE public.course_sections IS 'Course curriculum sections containing groups of lessons';
COMMENT ON TABLE public.course_lessons IS 'Individual lessons within course sections';
