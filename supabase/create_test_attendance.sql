-- Create test attendance data for live class demonstration
-- This script will:
-- 1. Update "class 11" to "live" status
-- 2. Create an attendance record for the enrolled user

-- First, let's get the user who is enrolled in C programming
DO $$
DECLARE
    v_user_id uuid;
    v_class_id uuid;
    v_course_id uuid;
BEGIN
    -- Find the C programming course
    SELECT id INTO v_course_id
    FROM courses
    WHERE title = 'C programming'
    LIMIT 1;

    -- Find the user enrolled in C programming
    SELECT user_id INTO v_user_id
    FROM orders
    WHERE item_type = 'course'
      AND item_id = v_course_id
      AND status IN ('paid', 'completed')
    LIMIT 1;

    -- Find the live class "class 11"
    SELECT id INTO v_class_id
    FROM live_classes
    WHERE course_id = v_course_id
      AND title = 'class 11'
    LIMIT 1;

    -- Update the class status to "live"
    UPDATE live_classes
    SET status = 'live',
        updated_at = NOW()
    WHERE id = v_class_id;

    -- Create attendance record if user and class exist
    IF v_user_id IS NOT NULL AND v_class_id IS NOT NULL THEN
        -- Insert attendance record (use ON CONFLICT to avoid duplicates)
        INSERT INTO class_attendance (class_id, user_id, joined_at, left_at, duration_minutes)
        VALUES (
            v_class_id,
            v_user_id,
            NOW() - INTERVAL '45 minutes',  -- Joined 45 minutes ago
            NOW() - INTERVAL '5 minutes',   -- Left 5 minutes ago
            40                               -- Attended for 40 minutes
        )
        ON CONFLICT (class_id, user_id) DO UPDATE
        SET joined_at = EXCLUDED.joined_at,
            left_at = EXCLUDED.left_at,
            duration_minutes = EXCLUDED.duration_minutes;

        RAISE NOTICE 'Successfully created attendance record for user % in class %', v_user_id, v_class_id;
    ELSE
        RAISE NOTICE 'Could not find user or class. User ID: %, Class ID: %', v_user_id, v_class_id;
    END IF;

    -- Show what we did
    RAISE NOTICE 'Class status updated to: %', (SELECT status FROM live_classes WHERE id = v_class_id);
END $$;

-- Verify the attendance record was created
SELECT 
    ca.id,
    ca.joined_at,
    ca.left_at,
    ca.duration_minutes,
    lc.title as class_title,
    c.title as course_title,
    p.display_name as student_name
FROM class_attendance ca
JOIN live_classes lc ON ca.class_id = lc.id
JOIN courses c ON lc.course_id = c.id
JOIN profiles p ON ca.user_id = p.id
WHERE lc.title = 'class 11'
ORDER BY ca.joined_at DESC;
