import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import dbConnect from "@/lib/mongodb/client"
import { User, AIModel, AIModelApiKey } from "@/lib/mongodb/models"
import { AiManager } from "./ai-manager"

export default async function AdminAiModelsPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/auth/login")

    await dbConnect()
    const user = await User.findOne({ email: session.user.email })

    if (!user || !user.isAdmin) {
        redirect("/dashboard")
    }

    // Fetch initial data
    const models = await AIModel.find().sort({ displayOrder: 1 }).lean()
    const keys = await AIModelApiKey.find().select('provider').lean()

    // Transform for client
    const cleanModels = JSON.parse(JSON.stringify(models))
    const cleanKeys = (JSON.parse(JSON.stringify(keys)) as Array<{ _id?: string; provider: string }>).map((k) => ({
        ...k,
        maskedKey: '••••••••'
    }))

    return (
        <div className="space-y-6 animate-fade-in p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-foreground">AI Models & Keys</h1>
                <p className="text-muted-foreground">Manage available AI models and configure API keys securely.</p>
            </div>

            <AiManager initialModels={cleanModels} initialKeys={cleanKeys} />
        </div>
    )
}
