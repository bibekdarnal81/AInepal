import { AiWorkspacePage } from '@/components/ai-workspace/ai-workspace-page'
import { fetchActiveAiTools } from '@/lib/ai-tools'

export default async function WorkspaceRoute() {
    const tools = await fetchActiveAiTools()
    return <AiWorkspacePage tools={tools} />
}
