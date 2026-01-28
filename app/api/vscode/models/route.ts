import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb/client'
import { AIModel } from '@/lib/mongodb/models'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        // Reuse the verification logic if possible, or leave public/key-protected.
        // Usually, model listing might require auth, but for an extension metadata fetch, 
        // passing the key is good practice.

        // Ensure the request has a valid key via middleware or manual check
        // For simplicity and to match the chat route, we should probably check auth.
        // But to just list models, maybe it's less critical. 
        // Let's implement basic key check similar to chat route for security.

        const { verifyApiKey } = await import('@/lib/auth/verifyApiKey')
        const verifiedUser = await verifyApiKey(request)

        if (!verifiedUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const models = await AIModel.find({
            isActive: true,
            disabled: { $ne: true },
            availableInVSCode: true
        })
            .select('modelId displayName provider description supportsStreaming supportsVision supportsImageGeneration')
            .sort({ displayOrder: 1 })
            .lean()

        return NextResponse.json({ models })

    } catch (error) {
        console.error('Error fetching VS Code models:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
