-- Create class_chat_messages table for live chat during classes
CREATE TABLE public.class_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT class_chat_messages_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS class_chat_messages_class_id_idx ON public.class_chat_messages(class_id);
CREATE INDEX IF NOT EXISTS class_chat_messages_created_at_idx ON public.class_chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.class_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read chat messages for classes they have access to
CREATE POLICY "Users can read chat messages for accessible classes"
ON public.class_chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.live_classes
    WHERE live_classes.id = class_id
    AND (
      live_classes.access_type = 'public'
      OR EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.user_id = auth.uid()
        AND orders.item_id = live_classes.course_id
        AND orders.item_type = 'course'
        AND orders.status = 'completed'
      )
    )
  )
);

-- Policy: Users can insert their own chat messages
CREATE POLICY "Users can insert their own chat messages"
ON public.class_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own chat messages"
ON public.class_chat_messages
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admins can delete any messages (moderation)
CREATE POLICY "Admins can delete any chat messages"
ON public.class_chat_messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Add comments
COMMENT ON TABLE public.class_chat_messages IS 'Live chat messages during classes';
