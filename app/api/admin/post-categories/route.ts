import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { PostCategory } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

// GET - List all post categories
export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const categories = await PostCategory.find()
            .sort({ name: 1 })
            .lean()

        const typedCategories = categories as unknown as Array<{
            _id: mongoose.Types.ObjectId
            name: string
            slug: string
            description?: string
            createdAt: Date
            updatedAt: Date
        }>

        const transformed = typedCategories.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
        }))

        return NextResponse.json({ categories: transformed })

    } catch (error) {
        console.error('Error fetching post categories:', error)
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await request.json()
        const { name, slug, description } = body

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
        }

        const existing = await PostCategory.findOne({ slug })
        if (existing) {
            return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 })
        }

        const category = await PostCategory.create({ name, slug, description: description || '' })

        return NextResponse.json({
            success: true,
            category: {
                id: category._id.toString(),
                name: category.name,
                slug: category.slug
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating post category:', error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await request.json()
        const { id, name, slug, description } = body

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
        }

        if (slug) {
            const existing = await PostCategory.findOne({ slug, _id: { $ne: id } })
            if (existing) {
                return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 })
            }
        }

        const updateData: Record<string, unknown> = {}
        if (name !== undefined) updateData.name = name
        if (slug !== undefined) updateData.slug = slug
        if (description !== undefined) updateData.description = description

        const category = await PostCategory.findByIdAndUpdate(id, updateData, { new: true })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, category: { id: category._id.toString(), name: category.name, slug: category.slug } })

    } catch (error) {
        console.error('Error updating post category:', error)
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

// DELETE - Delete category
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

        const category = await PostCategory.findByIdAndDelete(id)

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Category deleted successfully' })

    } catch (error) {
        console.error('Error deleting post category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
