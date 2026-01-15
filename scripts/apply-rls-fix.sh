#!/bin/bash

# Script to apply RLS fix directly to Supabase
# Run with: bash scripts/apply-rls-fix.sh

echo "🔧 Applying RLS fix to Supabase..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Get the project ref from the URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\///' | cut -d'.' -f1)

echo "Project Ref: $PROJECT_REF"
echo ""
echo "📝 Please run the following SQL in your Supabase SQL Editor:"
echo "   👉 https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat supabase/fix_contact_rls.sql
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Or copy from: $(pwd)/supabase/fix_contact_rls.sql"
echo ""
echo "After running the SQL, test your contact form!"
