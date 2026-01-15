import { AiWorkspacePage } from '@/components/ai-workspace/ai-workspace-page'
import { createClient } from '@/lib/supabase/server'

export default async function AiWorkspace() {
    // Fetch active AI models directly from Supabase
    const supabase = await createClient()
    const { data: models } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

    return <AiWorkspacePage models={models || []} />
}
