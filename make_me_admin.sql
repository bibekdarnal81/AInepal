-- QUICK FIX: Make your current logged-in user an admin
-- Run this in Supabase SQL Editor

-- This will make YOUR currently logged-in account an admin
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- Verify it worked (should show true)
SELECT email, is_admin 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = auth.uid();
