import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { AIModelApiKey, User } from '@/lib/mongodb/models'
import { encryptApiKey, maskApiKey } from '@/lib/ai-encryption'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const keys = await AIModelApiKey.find().sort({ provider: 1 })

        // Return masked keys
        const formattedKeys = keys.map(key => ({
            _id: key._id,
            provider: key.provider,
            maskedKey: '••••••••', // Don't expose even masked key if not needed, just valid status
            createdAt: key.createdAt,
            lastUsedAt: key.lastUsedAt
        }))

        return NextResponse.json(formattedKeys)
    } catch (error) {
        console.error('Error fetching keys:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { provider, apiKey } = await request.json()

        if (!provider || !apiKey) {
            return NextResponse.json({ error: 'Provider and API Key are required' }, { status: 400 })
        }

        // Encrypt the key
        const { encryptedKey, iv } = encryptApiKey(apiKey)

        // Upsert the key for the provider
        const result = await AIModelApiKey.findOneAndUpdate(
            { provider },
            {
                provider,
                encryptedApiKey: encryptedKey,
                encryptionIv: iv,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({
            success: true,
            provider: result.provider,
            message: 'API Key saved successfully'
        })
    } catch (error) {
        console.error('Error saving API key:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
