
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"
import { AudioInterface } from "@/components/home/audio-interface"
import dbConnect from '@/lib/mongodb/client'
import { AIModel } from '@/lib/mongodb/models'

export default async function AudioPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/audio")
    }

    await dbConnect()

    // Fetch models supported for Audio
    // Logic: OpenAI with 'tts' in ID, or DigitalOcean models
    const audioModels = await AIModel.find({
        $or: [
            { provider: 'openai', modelId: /tts/ },
            { provider: 'digitalocean', displayName: /Audio|TTS|Voice/i }
        ],
        isActive: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1 }).lean()

    const serializedModels = audioModels.map(m => ({
        ...m,
        _id: m._id.toString(),
        createdAt: m.createdAt?.toString(),
        updatedAt: m.updatedAt?.toString()
    }))

    return (
        <AudioInterface availableModels={serializedModels} />
    )
}
