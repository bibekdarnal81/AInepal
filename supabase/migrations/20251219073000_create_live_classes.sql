-- Create live_classes table for scheduling and managing live sessions
CREATE TABLE public.live_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('youtube', 'zoom', 'meet', 'custom')),
  stream_url TEXT,
  meeting_id TEXT,
  meeting_password TEXT,
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10, 2) DEFAULT 0,
  access_type TEXT NOT NULL DEFAULT 'enrolled' CHECK (access_type IN ('enrolled', 'public', 'paid')),
  max_attendees INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  recording_url TEXT,
  chat_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT live_classes_pkey PRIMARY KEY (id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS live_classes_course_id_idx ON public.live_classes(course_id);
CREATE INDEX IF NOT EXISTS live_classes_scheduled_at_idx ON public.live_classes(scheduled_at);
CREATE INDEX IF NOT EXISTS live_classes_status_idx ON public.live_classes(status);

-- Enable Row Level Security
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read public live classes
CREATE POLICY "Allow public to read public live classes"
ON public.live_classes
FOR SELECT
TO public
USING (access_type = 'public' OR access_type = 'enrolled');

-- Policy: Authenticated users can read all live classes
CREATE POLICY "Allow authenticated users to read all live classes"
ON public.live_classes
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only admins can insert/update/delete live classes
CREATE POLICY "Allow admins full access to live classes"
ON public.live_classes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Add comments
COMMENT ON TABLE public.live_classes IS 'Scheduled and live streaming classes for courses';
COMMENT ON COLUMN public.live_classes.stream_type IS 'Type of streaming: youtube, zoom, meet, or custom';
COMMENT ON COLUMN public.live_classes.access_type IS 'Who can access: enrolled (course students), public (anyone), paid (separate payment)';
COMMENT ON COLUMN public.live_classes.status IS 'Current status: scheduled, live, ended, cancelled';
