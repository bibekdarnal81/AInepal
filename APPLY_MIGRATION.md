# Quick Guide: Apply AI Models Migration

Since the automated migration failed, follow these steps to manually apply the migration:

## Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project (sitzjqtlqaygdhohrjqj)

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Copy the Migration SQL**
   - Open: `supabase/migrations/20250115083000_create_ai_models.sql`
   - Copy the ENTIRE file contents (228 lines)

4. **Paste and Run**
   - Paste the SQL into the SQL Editor
   - Click "Run" or press Cmd+Enter
   - Wait for success message

5. **Verify**
   - Go to "Table Editor" in the left sidebar
   - Look for `ai_models` and `ai_model_api_keys` tables
   - You should see 10 pre-configured AI models

6. **Test the Application**
   - Refresh http://localhost:3000/admin/ai-models
   - You should now see the list of AI models!

## Option 2: Quick Copy-Paste

The migration file is located at:
```
/Users/aasish/Project/Khesema/Company/rusha/supabase/migrations/20250115083000_create_ai_models.sql
```

If you have the file open, simply:
1. Select all (Cmd+A)
2. Copy (Cmd+C)  
3. Paste into Supabase SQL Editor
4. Run

## What the Migration Does

- ✅ Creates `ai_models` table with 10 pre-configured models
- ✅ Creates `ai_model_api_keys` table for secure key storage
- ✅ Sets up Row Level Security policies
- ✅ Creates indexes for performance
- ✅ Adds update triggers

## After Migration

Once successful, you can:
1. View models at `http://localhost:3000/admin/ai-models`
2. Edit a model to add your API key
3. Test the connection
4. Activate the model
5. Use it in the AI Workspace!

---

**Need Help?** Let me know if you encounter any errors when running the SQL!
