-- Fix chat_messages foreign key relationship with profiles
-- Run this in Supabase SQL Editor

-- Step 1: Check if chat_messages table has a foreign key to profiles
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chat_messages' AND tc.constraint_type = 'FOREIGN KEY';

-- Step 2: Drop existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_messages_user_id_fkey' 
        AND table_name = 'chat_messages'
    ) THEN
        ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_user_id_fkey;
    END IF;
END $$;

-- Step 3: Add the foreign key constraint with proper naming for PostgREST
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Step 4: Test the join query
SELECT 
    c.*,
    p.display_name
FROM chat_messages c
LEFT JOIN profiles p ON c.user_id = p.id
LIMIT 5;

-- Step 5: Verify the constraint was created
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chat_messages' AND tc.constraint_type = 'FOREIGN KEY';

-- SUCCESS! Now the admin chat page should be able to properly join profiles
