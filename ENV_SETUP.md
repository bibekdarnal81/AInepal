# Environment Variable Setup for Guest Chat

The guest chat feature requires the Supabase Service Role Key to bypass Row Level Security when creating guest sessions.

## Add to .env.local

Add this environment variable to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Finding Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Under **Project API keys**, find the **service_role** key (secret)
4. Copy the value

⚠️ **Important**: The service role key bypasses Row Level Security and should NEVER be exposed to the client. It should only be used in server-side code (API routes).

## Example .env.local Structure

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Add this line
```

## After Adding

1. Restart your dev server:
   ```bash
   # Press Ctrl+C to stop the server
   npm run dev
   ```

2. Test the guest chat form again

## Verification

If the service role key is missing, you'll see an error in the console:
```
Missing Supabase URL or Service Role Key
```

Once added correctly, guest sessions will be created successfully!
