import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { AIModel, User } from '@/lib/mongodb/models'

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

        const models = await AIModel.find().sort({ displayOrder: 1, provider: 1 })
        return NextResponse.json(models)
    } catch (error) {
        console.error('Error details:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        // ... auth check ...
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        // ... user check ...
        const user = await User.findOne({ email: session.user.email })
        if (!user || !user.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        // Basic validation
        if (!body.provider || !body.modelId || !body.displayName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const newModel = await AIModel.create(body)
        return NextResponse.json(newModel)
    } catch (error) {
        console.error('Error creating model:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
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

        const body = await request.json()
        const { _id, ...updateData } = body

        if (!_id) {
            return NextResponse.json({ error: 'Missing model ID' }, { status: 400 })
        }

        const updatedModel = await AIModel.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedModel) {
            return NextResponse.json({ error: 'Model not found' }, { status: 404 })
        }

        return NextResponse.json(updatedModel)
    } catch (error) {
        console.error('Error updating model:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
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

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing model ID' }, { status: 400 })
        }

        await AIModel.findByIdAndDelete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting model:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
