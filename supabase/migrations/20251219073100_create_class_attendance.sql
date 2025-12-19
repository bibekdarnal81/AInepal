-- Create class_attendance table for tracking student attendance
CREATE TABLE public.class_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT class_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT class_attendance_unique UNIQUE (class_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS class_attendance_class_id_idx ON public.class_attendance(class_id);
CREATE INDEX IF NOT EXISTS class_attendance_user_id_idx ON public.class_attendance(user_id);
CREATE INDEX IF NOT EXISTS class_attendance_joined_at_idx ON public.class_attendance(joined_at);

-- Enable Row Level Security
ALTER TABLE public.class_attendance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own attendance
CREATE POLICY "Users can read their own attendance"
ON public.class_attendance
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Users can insert their own attendance
CREATE POLICY "Users can insert their own attendance"
ON public.class_attendance
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own attendance (to record leaving)
CREATE POLICY "Users can update their own attendance"
ON public.class_attendance
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Admins can read all attendance
CREATE POLICY "Admins can read all attendance"
ON public.class_attendance
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Function to calculate duration when left_at is set
CREATE OR REPLACE FUNCTION calculate_attendance_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND NEW.joined_at IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
CREATE TRIGGER calculate_attendance_duration_trigger
BEFORE INSERT OR UPDATE ON public.class_attendance
FOR EACH ROW
EXECUTE FUNCTION calculate_attendance_duration();

-- Add comments
COMMENT ON TABLE public.class_attendance IS 'Tracks student attendance for live classes';
COMMENT ON COLUMN public.class_attendance.duration_minutes IS 'Auto-calculated from joined_at and left_at';
