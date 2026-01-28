
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { UserApiKey } from '@/lib/mongodb/models'

// PUT: Toggle active status or (in future) update domains
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const { id } = params
        const body = await request.json()
        const { isActive } = body

        console.log('API Key Toggle:', { id, isActive })

        await dbConnect()

        const apiKey = await UserApiKey.findById(id)

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key not found' }, { status: 404 })
        }

        // Update fields if provided
        if (typeof isActive === 'boolean') {
            apiKey.isActive = isActive
        }

        await apiKey.save()

        return NextResponse.json({
            success: true,
            apiKey: {
                id: apiKey._id.toString(),
                isActive: apiKey.isActive
            }
        })

    } catch (error) {
        console.error('Error updating API key:', error)
        return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
    }
}

// DELETE: Revoke a single key
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const params = await props.params
        const { id } = params

        await dbConnect()

        const result = await UserApiKey.deleteOne({ _id: id })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'API Key not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error revoking API key:', error)
        return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 })
    }
}
