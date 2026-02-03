import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb/client"
import { AIModel, type IAIModel, User, Membership } from "@/lib/mongodb/models"
import { ChatInterface } from "@/components/home/chat-interface"

export default async function CodePage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/code")
    }

    await dbConnect()

    // Fetch active models (exclude disabled)
    const models = await AIModel.find({
        isActive: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1 }).lean()

    // Process models to prioritize code models
    const processedModels = JSON.parse(JSON.stringify(models)).sort((a: IAIModel, b: IAIModel) => {
        // 1. Prioritize Qwen models (specifically Qwen2.5-Coder or similar if present)
        const aIsQwen = a.modelName.toLowerCase().includes('qwen') || a.displayName.toLowerCase().includes('qwen')
        const bIsQwen = b.modelName.toLowerCase().includes('qwen') || b.displayName.toLowerCase().includes('qwen')

        if (aIsQwen && !bIsQwen) return -1
        if (!aIsQwen && bIsQwen) return 1

        // 2. Prioritize models with supportsCodeGeneration
        if (a.supportsCodeGeneration && !b.supportsCodeGeneration) return -1
        if (!a.supportsCodeGeneration && b.supportsCodeGeneration) return 1

        // 3. Fallback to display order (maintained from DB sort)
        return 0
    })

    const cleanModels = processedModels

    // Fetch user details with membership info
    const user = await User.findById(session.user.id)
        .select('advancedCredits membershipId membershipStatus')
        .lean()

    const advancedCredits = user?.advancedCredits || 0
    let membershipName = ''
    let membershipAdvancedCredits = 0

    // Fetch membership to get advancedCredits from the plan
    if (user?.membershipId && user?.membershipStatus === 'active') {
        const membership = await Membership.findById(user.membershipId)
            .select('name advancedCredits')
            .lean()
        if (membership) {
            membershipName = membership.name || ''
            membershipAdvancedCredits = membership.advancedCredits || 0
        }
    }

    return (
        <ChatInterface
            availableModels={cleanModels}
            advancedCredits={advancedCredits}
            membershipName={membershipName}
            membershipAdvancedCredits={membershipAdvancedCredits}
        />
    )
}
