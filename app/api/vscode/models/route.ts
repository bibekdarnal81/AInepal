import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb/client'
import { AIModel } from '@/lib/mongodb/models'

export async function GET() {
    try {
        await dbConnect()

        // Models endpoint is public - listing available models is metadata
        // The actual chat API still requires authentication for security
        // This allows the VSCode extension to fetch models without auth

        const models = await AIModel.find({
            isActive: true,
            disabled: { $ne: true },
            availableInVSCode: true
        })
            .select('modelId displayName provider description supportsStreaming supportsVision supportsImageGeneration')
            .sort({ displayOrder: 1 })
            .lean()

        return NextResponse.json(models)

    } catch (error) {
        console.error('Error fetching VS Code models:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
