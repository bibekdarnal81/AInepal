# Apply Multi-AI Workspace Migrations

This document provides instructions for applying the database migrations for the multi-AI workspace feature.

## Quick Start

Run these commands to apply the migrations:

```bash
cd /Users/aasish/Project/Khesema/Company/rusha

# Using Supabase CLI (recommended)
npx supabase db push

# Or login to Supabase and run manually
```

## Migrations to Apply

### 1. User AI Preferences Table
File: `supabase/migrations/20250117083000_user_ai_preferences.sql`

Creates:
- `user_ai_preferences` table
- RLS policies for user data security
- Indexes for performance
- Automatic triggers for timestamps

### 2. Additional AI Models
File: `supabase/migrations/20250117090000_add_more_ai_models.sql`

Adds:
- Perplexity Sonar
- xAI Grok 3 Mini
- Mistral Small & Codestral
- GPT-4o Mini, GPT-5 Mini
- Gemini 2.5 Lite
- Claude Haiku 4.5

Sets Gemini 2.0 Flash as active by default.

## Manual Application (If CLI Fails)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. For each migration file:
   - Open the file in your code editor
   - Copy the entire SQL content
   - Paste into Supabase SQL Editor
   - Click "Run"

## Verification

After running migrations, verify with this SQL:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_ai_preferences', 'ai_models');

-- Check AI models
SELECT display_name, provider, is_active, display_order
FROM ai_models
ORDER BY display_order;

-- Should show at least Gemini 2.0 Flash as active
```

## After Migrations

1. Refresh `http://localhost:3000/workspace`
2. The model selector should now show available AI models
3. You can start selecting and chatting with models

## Troubleshooting

**Error: "relation user_ai_preferences does not exist"**
- Run the first migration: `20250117083000_user_ai_preferences.sql`

**Error: "No AI models available"**
- Run the second migration: `20250117090000_add_more_ai_models.sql`
- Or check that at least one model has `is_active = true`

**API Key Errors**
- Models will show errors if their API keys are not configured
- Configure API keys in `ai_model_api_keys` table (admin feature pending)
- Start with Gemini (Google API key) as it's free
