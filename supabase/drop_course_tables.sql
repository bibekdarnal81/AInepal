-- SQL Script: Drop All Course-Related Database Tables
-- WARNING: This will permanently delete all course data
-- Execute this script carefully

-- Drop tables in reverse dependency order (children first, then parents)

-- 1. Drop class_chat_messages (depends on live_classes and profiles)
DROP TABLE IF EXISTS public.class_chat_messages CASCADE;

-- 2. Drop class_attendance (depends on live_classes and profiles)
DROP TABLE IF EXISTS public.class_attendance CASCADE;

-- 3. Drop live_classes (depends on courses)
DROP TABLE IF EXISTS public.live_classes CASCADE;

-- 4. Drop course_lessons (depends on course_sections)
DROP TABLE IF EXISTS public.course_lessons CASCADE;

-- 5. Drop course_sections (depends on courses)
DROP TABLE IF EXISTS public.course_sections CASCADE;

-- 6. Drop courses (base table)
DROP TABLE IF EXISTS public.courses CASCADE;

-- Note: CASCADE will automatically drop associated:
-- - Foreign key constraints
-- - Indexes
-- - RLS policies
-- - Triggers
-- - Functions (if only used by these tables)

-- Verify tables are dropped
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'courses', 
  'course_sections', 
  'course_lessons', 
  'live_classes', 
  'class_attendance', 
  'class_chat_messages'
)
ORDER BY table_name;

-- Expected result: 0 rows
