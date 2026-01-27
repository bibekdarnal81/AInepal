import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import { AIModel } from '@/lib/mongodb/models'

export async function GET() {
    try {
        await dbConnect()

        const modelData = {
            provider: 'google',
            modelName: 'nano-banana-pro',
            displayName: 'Nano Banana Pro',
            modelId: 'gemini-1.5-pro',
            description: "Google's latest multimodal model capable of producing crisp, high-quality images with advanced text-image generation abilities",
            supportsImageGeneration: true,
            supportsVision: true,
            supportsStreaming: true, // Critical for Chat
            isActive: true,
            displayOrder: 10
        }

        // Upsert
        const result = await AIModel.findOneAndUpdate(
            { provider: modelData.provider, modelName: modelData.modelName },
            modelData,
            { upsert: true, new: true }
        )

        return NextResponse.json({ success: true, model: result })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
