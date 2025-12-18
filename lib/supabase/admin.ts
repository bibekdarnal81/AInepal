import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase admin client that bypasses RLS
 * Use this only for operations that require elevated permissions
 * such as creating guest sessions, admin operations, etc.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRole) {
        throw new Error('Missing Supabase URL or Service Role Key')
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceRole, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
