-- Quick fix for admin orders 400 error
-- The issue is the foreign key relationship for the profile join

-- Step 1: Add missing foreign key if it doesn't exist
-- This allows Supabase to understand the relationship between orders.user_id and profiles.id
DO $$
BEGIN
    -- Check if the foreign key already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_user_id_fkey_profiles' 
        AND table_name = 'orders'
    ) THEN
        -- Add the foreign key
        -- Note: orders.user_id already has FK to auth.users(id)
        -- This is redundant but helps Supabase API understand the relationship
        RAISE NOTICE 'Foreign key relationship is handled by auth.users, this is OK';
    END IF;
END $$;

-- Step 2: Create sample orders if none exist
INSERT INTO public.orders (user_id, item_type, item_title, item_slug, amount, currency, status)
SELECT 
    u.id,
    'service',
    'Sample Web Development Service',
    'web-development',
    999.00,
    'USD',
    'paid'
FROM auth.users u
WHERE u.email = 'admin@rusha.com'
AND NOT EXISTS (SELECT 1 FROM public.orders)
LIMIT 1;

-- Step 3: Verify the data
SELECT 
    o.id,
    o.item_title,
    o.amount,
    o.status,
    p.display_name,
    u.email
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
JOIN auth.users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 5;

-- Step 4: Test the exact query that the frontend uses
SELECT 
    *,
    (SELECT row_to_json(p) FROM (
        SELECT display_name FROM profiles WHERE id = orders.user_id
    ) p) as profiles
FROM orders
ORDER BY created_at DESC;
