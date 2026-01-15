import { AiWorkspacePage } from '@/components/ai-workspace/ai-workspace-page'
import { fetchActiveAiTools } from '@/lib/ai-tools'

export default async function DashboardRoute() {
    const tools = await fetchActiveAiTools()
    return <AiWorkspacePage tools={tools} />
}
