
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { Class } from '@/lib/mongodb/models/Class'
import { User } from '@/lib/mongodb/models/User'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        await dbConnect()

        const classItem = await Class.findById(id).lean()
        if (!classItem) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 })
        }

        return NextResponse.json(classItem)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await dbConnect()
        // Verify Admin
        const user = await User.findById(session.user.id)
        if (!user || (!user.isAdmin && user.email !== 'admin@example.com')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()

        // If updating slug, check uniqueness
        if (body.slug) {
            const existingClass = await Class.findOne({
                slug: body.slug,
                _id: { $ne: id }
            })
            if (existingClass) {
                return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
            }
        }

        const updatedClass = await Class.findByIdAndUpdate(
            id,
            { ...body },
            { new: true, runValidators: true }
        )

        if (!updatedClass) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 })
        }

        return NextResponse.json(updatedClass)

    } catch (error: any) {
        console.error('Error updating class:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await dbConnect()
        // Verify Admin
        const user = await User.findById(session.user.id)
        if (!user || (!user.isAdmin && user.email !== 'admin@example.com')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { id } = await params

        const deletedClass = await Class.findByIdAndDelete(id)
        if (!deletedClass) {
            return NextResponse.json({ error: 'Class not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
