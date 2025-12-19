-- Simplified approach: Direct INSERT with hardcoded values
-- Run this in Supabase SQL Editor

-- Step 1: Check what we have
SELECT 
    c.id as course_id,
    c.title as course_title,
    lc.id as class_id,
    lc.title as class_title,
    lc.status as class_status
FROM courses c
LEFT JOIN live_classes lc ON lc.course_id = c.id
WHERE c.title = 'C programming';

-- Step 2: Check enrolled users
SELECT 
    o.user_id,
    p.display_name,
    o.item_title,
    o.status
FROM orders o
JOIN profiles p ON p.id = o.user_id
WHERE o.item_title = 'C programming'
  AND o.item_type = 'course';

-- Step 3: Check if attendance already exists
SELECT * FROM class_attendance
WHERE class_id IN (
    SELECT id FROM live_classes WHERE title = 'class 11'
);
