import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb/client"
import { AIModel, User, Membership } from "@/lib/mongodb/models"
import { ChatInterface } from "@/components/home/chat-interface"

export default async function HomePage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/chat")
    }

    await dbConnect()

    // Fetch active models (exclude disabled)
    const models = await AIModel.find({
        isActive: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1 }).lean()
    const cleanModels = JSON.parse(JSON.stringify(models))

    // Fetch user details with membership info
    const user = await User.findById(session.user.id)
        .select('advancedCredits membershipId membershipStatus')
        .lean()
    
    let advancedCredits = user?.advancedCredits || 0
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
