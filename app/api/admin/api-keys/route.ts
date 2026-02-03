import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { UserApiKey } from '@/lib/mongodb/models'
import crypto from 'crypto'

// Generate a secure random API key
function generateApiKey() {
    return 'sk_live_' + crypto.randomBytes(24).toString('hex')
}

export async function GET(_request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Fetch all API keys for admin view. 
        // If needed, we can restrict this to only the current user's keys, 
        // but typically admins might want to manage system-wide keys or their own keys.
        // For now, let's return all keys but populate user details.
        const apiKeys = await UserApiKey.find()
            .populate('userId', 'email displayName isSuspended')
            .sort({ createdAt: -1 })
            .lean()

        const transformedKeys = apiKeys.map(key => ({
            id: key._id.toString(),
            name: key.name,
            key: key.key.substring(0, 12) + '...', // Mask key for listing
            lastUsedAt: key.lastUsedAt,
            expiresAt: key.expiresAt,
            allowedDomains: key.allowedDomains,
            isActive: key.isActive !== false, // Handle older keys where field might be missing (default true)
            createdAt: key.createdAt,
            user: key.userId ? typeGuardUser(key.userId) : null
        }))

        return NextResponse.json({ apiKeys: transformedKeys })

    } catch (error) {
        console.error('Error fetching API keys:', error)
        return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, allowedDomains } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        await dbConnect()

        const newKey = generateApiKey()

        const apiKeyDoc = await UserApiKey.create({
            userId: session.user.id,
            name,
            key: newKey,
            allowedDomains: Array.isArray(allowedDomains) ? allowedDomains : [],
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return NextResponse.json({
            success: true,
            apiKey: {
                id: apiKeyDoc._id.toString(),
                name: apiKeyDoc.name,
                key: apiKeyDoc.key, // Return full key ONLY on creation
                allowedDomains: apiKeyDoc.allowedDomains,
                createdAt: apiKeyDoc.createdAt
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating API key:', error)
        return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }
}

// Helper to handle populated user field type safety
function typeGuardUser(user: unknown) {
    const u = user as { email: string; displayName?: string; isSuspended?: boolean }
    return {
        email: u.email,
        displayName: u.displayName,
        isSuspended: u.isSuspended
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
        }

        await dbConnect()

        const result = await UserApiKey.deleteMany({ _id: { $in: ids } })

        return NextResponse.json({
            success: true,
            count: result.deletedCount
        })

    } catch (error) {
        console.error('Error batch deleting API keys:', error)
        return NextResponse.json({ error: 'Failed to delete API keys' }, { status: 500 })
    }
}
