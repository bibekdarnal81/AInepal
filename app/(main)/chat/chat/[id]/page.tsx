import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb/client"
import { AIModel, UserChatSession } from "@/lib/mongodb/models"
import { ChatSessionInterface } from "@/components/home/chat-session-interface"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ChatSessionPage({ params }: PageProps) {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/chat")
    }

    const { id } = await params

    await dbConnect()

    // Fetch the chat session
    const chatSession = await UserChatSession.findOne({
        _id: id,
        userId: session.user.id,
        isActive: true
    }).lean()

    if (!chatSession) {
        redirect("/chat")
    }

    // Fetch active models
    const models = await AIModel.find({
        isActive: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1 }).lean()

    const cleanModels = JSON.parse(JSON.stringify(models))
    const cleanSession = JSON.parse(JSON.stringify({
        id: chatSession._id.toString(),
        title: chatSession.title,
        modelId: chatSession.modelId,
        messages: chatSession.messages || [],
    }))

    return (
        <ChatSessionInterface
            availableModels={cleanModels}
            initialSession={cleanSession}
        />
    )
}
