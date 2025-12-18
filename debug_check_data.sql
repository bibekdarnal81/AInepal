-- Check if there are any orders in the database
SELECT 
    o.*,
    p.display_name,
    p.email
FROM orders o
LEFT JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC;

-- Also check just the count
SELECT COUNT(*) as total_orders FROM orders;

-- Check if profiles exist
SELECT id, display_name, email, is_admin FROM profiles;

-- Check chat messages
SELECT COUNT(*) as total_messages FROM chat_messages;
