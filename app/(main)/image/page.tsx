import { ThumbnailCreator } from "@/components/image/thumbnail-creator"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb/client"
import { AIModel } from "@/lib/mongodb/models"

export default async function ImagePage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/login?callbackUrl=/image")
    }

    await dbConnect()
    const models = await AIModel.find({
        supportsImageGeneration: true,
        disabled: { $ne: true }
    }).sort({ displayOrder: 1, displayName: 1 }).lean()

    const availableModels = JSON.parse(JSON.stringify(models))

    return <ThumbnailCreator availableModels={availableModels} />
}
