#!/usr/bin/env node

/**
 * Script to fix RLS policies for contact_messages table
 * Run with: node scripts/fix-contact-rls.mjs
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixRLSPolicies() {
    console.log('🔧 Fixing RLS policies for contact_messages table...\n')

    const queries = [
        {
            name: 'Drop existing INSERT policy',
            sql: 'DROP POLICY IF EXISTS "Allow public to submit contact messages" ON public.contact_messages;'
        },
        {
            name: 'Drop existing SELECT policy',
            sql: 'DROP POLICY IF EXISTS "Allow authenticated users to read contact messages" ON public.contact_messages;'
        },
        {
            name: 'Drop existing UPDATE policy',
            sql: 'DROP POLICY IF EXISTS "Allow authenticated users to update contact messages" ON public.contact_messages;'
        },
        {
            name: 'Drop existing DELETE policy',
            sql: 'DROP POLICY IF EXISTS "Allow authenticated users to delete contact messages" ON public.contact_messages;'
        },
        {
            name: 'Create INSERT policy for anonymous and authenticated users',
            sql: `CREATE POLICY "Allow public to submit contact messages"
                  ON public.contact_messages
                  FOR INSERT
                  TO anon, authenticated
                  WITH CHECK (true);`
        },
        {
            name: 'Create SELECT policy for authenticated users',
            sql: `CREATE POLICY "Allow authenticated users to read contact messages"
                  ON public.contact_messages
                  FOR SELECT
                  TO authenticated
                  USING (true);`
        },
        {
            name: 'Create UPDATE policy for authenticated users',
            sql: `CREATE POLICY "Allow authenticated users to update contact messages"
                  ON public.contact_messages
                  FOR UPDATE
                  TO authenticated
                  USING (true)
                  WITH CHECK (true);`
        },
        {
            name: 'Create DELETE policy for authenticated users',
            sql: `CREATE POLICY "Allow authenticated users to delete contact messages"
                  ON public.contact_messages
                  FOR DELETE
                  TO authenticated
                  USING (true);`
        }
    ]

    for (const query of queries) {
        console.log(`⏳ ${query.name}...`)

        const { error } = await supabase.rpc('exec_sql', { sql_query: query.sql }).catch(() => {
            // If rpc doesn't exist, try direct query
            return supabase.from('_sql').select('*').limit(0)
        })

        // Try alternative method using REST API
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query.sql })
            })

            if (response.ok) {
                console.log(`✅ ${query.name} - Success`)
            } else {
                console.log(`⚠️  ${query.name} - Skipped (use SQL Editor)`)
            }
        } catch (err) {
            console.log(`⚠️  ${query.name} - Skipped (use SQL Editor)`)
        }
    }

    console.log('\n⚠️  Note: If the script couldn\'t execute the queries automatically,')
    console.log('please run the SQL from supabase/fix_contact_rls.sql in your Supabase SQL Editor.')
    console.log('\nSteps:')
    console.log('1. Go to https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the contents of supabase/fix_contact_rls.sql')
    console.log('5. Click "Run"\n')
}

fixRLSPolicies()
    .then(() => {
        console.log('✅ Script completed\n')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Error:', error.message)
        process.exit(1)
    })
