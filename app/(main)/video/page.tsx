import { VideoInterface } from "@/components/home/video-interface"
import dbConnect from "@/lib/mongodb/client"
import { AIModel } from "@/lib/mongodb/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { redirect } from "next/navigation"

export default async function VideoPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/video")
    }

    await dbConnect()

    // Fetch active models that support video generation (exclude disabled)
    const models = await AIModel.find({
        isActive: true,
        supportsVideoGeneration: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1 }).lean()

    const cleanModels = JSON.parse(JSON.stringify(models))

    return <VideoInterface availableModels={cleanModels} />
}
