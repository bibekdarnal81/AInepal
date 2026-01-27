import { ImageInterface } from "@/components/home/image-interface"
import dbConnect from "@/lib/mongodb/client"
import { AIModel } from "@/lib/mongodb/models"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function ImagePage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/image")
    }

    await dbConnect()

    // Fetch active models that support image generation (exclude disabled)
    const models = await AIModel.find({
        isActive: true,
        supportsImageGeneration: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1 }).lean()

    // Also fetch legacy models for backward compatibility if needed, or rely on admin config
    // For now, let's pass the fetched models
    const cleanModels = JSON.parse(JSON.stringify(models))

    return <ImageInterface availableModels={cleanModels} />
}
