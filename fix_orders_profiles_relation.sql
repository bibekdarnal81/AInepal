-- Fix the orders-profiles relationship for Supabase PostgREST
-- Run this in your Supabase SQL Editor

-- Step 1: Check if orders table exists and has data
SELECT COUNT(*) as order_count FROM orders;

-- Step 2: Check if profiles table exists and has data  
SELECT COUNT(*) as profile_count FROM profiles;

-- Step 3: Check current foreign key constraints on orders table
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
WHERE tc.table_name = 'orders' AND tc.constraint_type = 'FOREIGN KEY';

-- Step 4: Add a proper foreign key constraint from orders.user_id to profiles.id if it doesn't exist
-- First, drop existing constraint if it exists (to recreate it properly)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint with proper naming for PostgREST
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

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
WHERE tc.table_name = 'orders' AND tc.constraint_type = 'FOREIGN KEY';

-- Step 6: Test the join query that PostgREST will use
SELECT 
    o.*,
    p.display_name
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LIMIT 5;

-- Step 7: Grant necessary permissions
GRANT SELECT ON orders TO authenticated;
GRANT SELECT ON profiles TO authenticated;
