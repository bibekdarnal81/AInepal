-- Verify that all course-related tables have been dropped
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

-- Expected result: 0 rows (all tables should be gone)
