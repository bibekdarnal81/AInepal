import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch user's AI model preferences with model details
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch ALL active AI models first
        const { data: activeModels, error: modelsError } = await supabase
            .from('ai_models')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (modelsError) {
            return NextResponse.json({ error: modelsError.message }, { status: 500 })
        }

        if (!activeModels || activeModels.length === 0) {
            return NextResponse.json({ preferences: [] })
        }

        // Fetch existing user preferences
        const { data: userPrefs } = await supabase
            .from('user_ai_preferences')
            .select('*')
            .eq('user_id', user.id)

        // Create a map of existing preferences
        const prefsMap = new Map(
            userPrefs?.map(pref => [pref.model_id, pref]) || []
        )

        // Build preferences array combining ALL active models with user preferences
        const preferences = activeModels.map((model, index) => {
            const existingPref = prefsMap.get(model.id)

            return {
                id: existingPref?.id || `temp-${model.id}`,
                user_id: user.id,
                model_id: model.id,
                is_active: existingPref?.is_active ?? true,
                display_order: existingPref?.display_order ?? index,
                custom_temperature: existingPref?.custom_temperature,
                custom_max_tokens: existingPref?.custom_max_tokens,
                created_at: existingPref?.created_at || new Date().toISOString(),
                updated_at: existingPref?.updated_at || new Date().toISOString(),
                last_used_at: existingPref?.last_used_at,
                model: model
            }
        })

        // Sort by display order
        preferences.sort((a, b) => a.display_order - b.display_order)

        return NextResponse.json({ preferences })
    } catch (error) {
        console.error('Error fetching user AI preferences:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user AI preferences' },
            { status: 500 }
        )
    }
}

// PUT - Update user's AI model preferences (activate/deactivate, reorder)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { preferences } = body

        if (!preferences || !Array.isArray(preferences)) {
            return NextResponse.json(
                { error: 'Invalid request body: preferences array required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Update each preference
        const updates = preferences.map(async (pref: any) => {
            const updateData: any = {
                is_active: pref.is_active,
                display_order: pref.display_order
            }

            if (pref.custom_temperature !== undefined) {
                updateData.custom_temperature = pref.custom_temperature
            }
            if (pref.custom_max_tokens !== undefined) {
                updateData.custom_max_tokens = pref.custom_max_tokens
            }

            // Check if preference exists
            const { data: existing } = await supabase
                .from('user_ai_preferences')
                .select('id')
                .eq('user_id', user.id)
                .eq('model_id', pref.model_id)
                .single()

            if (existing) {
                // Update existing preference
                return supabase
                    .from('user_ai_preferences')
                    .update(updateData)
                    .eq('user_id', user.id)
                    .eq('model_id', pref.model_id)
            } else {
                // Insert new preference
                return supabase
                    .from('user_ai_preferences')
                    .insert({
                        user_id: user.id,
                        model_id: pref.model_id,
                        ...updateData
                    })
            }
        })

        await Promise.all(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating user AI preferences:', error)
        return NextResponse.json(
            { error: 'Failed to update user AI preferences' },
            { status: 500 }
        )
    }
}

// POST - Initialize user preferences for all active models (first-time setup)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all active models
        const { data: activeModels, error: modelsError } = await supabase
            .from('ai_models')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })

        if (modelsError) {
            return NextResponse.json({ error: modelsError.message }, { status: 500 })
        }

        // Check if user already has preferences
        const { data: existingPrefs } = await supabase
            .from('user_ai_preferences')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)

        if (existingPrefs && existingPrefs.length > 0) {
            return NextResponse.json({ message: 'User preferences already initialized' })
        }

        // Create preferences for all active models
        const preferences = activeModels?.map((model, index) => ({
            user_id: user.id,
            model_id: model.id,
            is_active: true,
            display_order: index
        })) || []

        const { error: insertError } = await supabase
            .from('user_ai_preferences')
            .insert(preferences)

        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, count: preferences.length })
    } catch (error) {
        console.error('Error initializing user AI preferences:', error)
        return NextResponse.json(
            { error: 'Failed to initialize user AI preferences' },
            { status: 500 }
        )
    }
}
