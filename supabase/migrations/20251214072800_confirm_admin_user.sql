-- Confirm admin user email
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'admin@NextNepal.com';
