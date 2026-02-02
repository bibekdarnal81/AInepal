import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { ProjectCategory } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const categories = await ProjectCategory.find().sort({ displayOrder: 1, name: 1 }).lean()
        const typedCategories = categories as unknown as Array<{
            _id: mongoose.Types.ObjectId
            name: string
            slug: string
            description?: string
            color?: string
            iconName?: string
            displayOrder?: number
            createdAt: Date
        }>

        return NextResponse.json({
            categories: typedCategories.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                slug: c.slug,
                description: c.description || '',
                color: c.color || '#3b82f6',
                iconName: c.iconName || '',
                displayOrder: c.displayOrder || 0,
                createdAt: c.createdAt
            }))
        })

    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const body = await request.json()
        const { name, slug, description, color, iconName, displayOrder } = body

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
        }

        const existing = await ProjectCategory.findOne({ slug })
        if (existing) {
            return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 })
        }

        const category = await ProjectCategory.create({
            name, slug, description: description || '', color: color || '#3b82f6',
            iconName: iconName || '', displayOrder: displayOrder || 0
        })

        return NextResponse.json({ success: true, category: { id: category._id.toString(), name: category.name } }, { status: 201 })

    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const body = await request.json()
        const { id, ...updateFields } = body

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
        }

        if (updateFields.slug) {
            const existing = await ProjectCategory.findOne({ slug: updateFields.slug, _id: { $ne: id } })
            if (existing) {
                return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 })
            }
        }

        const category = await ProjectCategory.findByIdAndUpdate(id, updateFields, { new: true })
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, category: { id: category._id.toString(), name: category.name } })

    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
        }

        await dbConnect()
        const category = await ProjectCategory.findByIdAndDelete(id)
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Category deleted' })

    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
