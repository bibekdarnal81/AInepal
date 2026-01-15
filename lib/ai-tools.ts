import { createClient } from '@/lib/supabase/server'

export interface AiTool {
    id: string
    name: string
    description: string | null
    icon: string | null
    category: string | null
    display_order: number
}

export async function fetchActiveAiTools(): Promise<AiTool[]> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('ai_tools')
        .select('id, name, description, icon, category, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

    return data ?? []
}
