# Admin Chat Setup Guide

## Creating an Admin Account

You need to create an admin user to access `/admin/chat`. Here's how:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Run this SQL:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users;

-- Then, set yourself as admin (replace 'your-user-id' with actual ID)
UPDATE profiles 
SET is_admin = true 
WHERE id = 'your-user-id';

-- Verify it worked
SELECT * FROM profiles WHERE is_admin = true;
```

### Option 2: Via Registration

1. Register a new account at `/auth/register`
   - Email: `admin@yourdomain.com`
   - Password: `securepassword`
   
2. After registering, run SQL in Supabase dashboard:

```sql
-- Make the new account admin
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'admin@yourdomain.com'
);
```

3. Logout and login again

---

## Testing the Chat System

### Step 1: Create Test User (Regular User)
1. Open incognito window
2. Go to `http://localhost:3000`
3. Click chat widget
4. Enter name "Test User"
5. Register account
6. Send a test message in chat

### Step 2: Login as Admin
1. In normal browser window
2. Go to `/admin/login`
3. Login with admin credentials
4. Go to `/admin/chat`
5. You should see the test user's conversation
6. Click on the user
7. Reply to their message

### Step 3: Verify Real-time
1. Switch to incognito window (test user)
2. Chat should show admin's reply
3. Type response
4. Switch back to admin window
5. Should see new message appear

---

## Quick Admin Setup Command

If you want to quickly make your current logged-in user an admin:

```sql
-- In Supabase SQL Editor, run:
UPDATE profiles 
SET is_admin = true 
WHERE id = auth.uid();
```

Then logout and login again.

---

## Troubleshooting

**Can't see `/admin/chat`?**
- Make sure you're logged in as admin
- Check `profiles` table has `is_admin = true`
- Hard refresh: Cmd+Shift+R

**No users in chat list?**
- Users must send at least one message
- Test by sending a message as regular user first

**Messages not sending?**
- Check browser console (F12) for errors
- Verify Supabase realtime is enabled
- Check RLS policies on `chat_messages` table
