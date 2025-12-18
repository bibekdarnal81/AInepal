-- Complete Admin Panel Fix
-- Run this in Supabase SQL Editor while logged in to your app
-- This will fix BOTH orders and chat functionality

-- ============================================
-- PART 1: Make Current User Admin
-- ============================================

UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();

-- Verify you're now an admin
SELECT 
    u.email,
    p.is_admin,
    p.display_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.id = auth.uid();

-- ============================================
-- PART 2: Fix Orders Foreign Key
-- ============================================

-- Drop existing constraint if it exists
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

-- ============================================
-- PART 3: Fix Chat Messages Foreign Key
-- ============================================

-- Drop existing constraint if it exists
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

-- Add the foreign key constraint with proper naming for PostgREST
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- ============================================
-- PART 4: Create Test Orders
-- ============================================

INSERT INTO orders (user_id, item_type, item_id, item_title, item_slug, amount, currency, status, payment_method)
VALUES 
    (auth.uid(), 'service', gen_random_uuid(), 'Web Development Service', 'web-development', 299.99, 'USD', 'paid', 'stripe'),
    (auth.uid(), 'service', gen_random_uuid(), 'SEO Optimization', 'seo-optimization', 149.99, 'USD', 'pending', 'stripe'),
    (auth.uid(), 'course', gen_random_uuid(), 'Advanced React Course', 'advanced-react', 99.99, 'USD', 'paid', 'stripe'),
    (auth.uid(), 'course', gen_random_uuid(), 'Next.js Masterclass', 'nextjs-masterclass', 199.99, 'USD', 'cancelled', 'stripe')
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 5: Create Test Chat Messages (Optional)
-- ============================================

-- Create some test chat messages to test the chat feature
INSERT INTO chat_messages (user_id, message, is_admin, is_read)
VALUES 
    (auth.uid(), 'Hello! I have a question about your services.', false, false),
    (auth.uid(), 'Can you help me with a custom project?', false, true),
    (auth.uid(), 'Thank you for your response!', false, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 6: Verify Everything
-- ============================================

-- Check orders with user info
SELECT 
    o.id,
    o.item_title,
    o.amount,
    o.status,
    o.created_at,
    p.display_name as customer_name,
    u.email as customer_email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY o.created_at DESC
LIMIT 10;

-- Check chat messages with user info
SELECT 
    c.id,
    c.message,
    c.is_admin,
    c.is_read,
    c.created_at,
    p.display_name as user_name,
    u.email as user_email
FROM chat_messages c
LEFT JOIN profiles p ON c.user_id = p.id
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY c.created_at DESC
LIMIT 10;

-- Check foreign keys are properly set
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
WHERE tc.table_name IN ('orders', 'chat_messages') 
AND tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'profiles';

-- ============================================
-- SUCCESS!
-- ============================================
-- If all queries ran successfully, you should now:
-- 1. Be an admin user ✅
-- 2. Have proper foreign keys for orders ✅
-- 3. Have proper foreign keys for chat_messages ✅
-- 4. Have test orders to view ✅
-- 5. Have test chat messages (optional) ✅
-- 
-- Now refresh these pages:
-- - http://localhost:3000/admin/orders
-- - http://localhost:3000/admin/chat
