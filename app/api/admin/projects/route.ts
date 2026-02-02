import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Project, ProjectCategory } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const categoryId = searchParams.get('categoryId')
        const status = searchParams.get('status')

        const query: Record<string, unknown> = {}
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }
        if (categoryId) query.categoryId = categoryId
        if (status === 'published') query.isPublished = true
        else if (status === 'draft') query.isPublished = false

        const skip = (page - 1) * limit

        const [projects, total, categories] = await Promise.all([
            Project.find(query).populate('categoryId', 'name slug color').sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
            Project.countDocuments(query),
            ProjectCategory.find().sort({ name: 1 }).lean()
        ])

        const typedProjects = projects as unknown as Array<{
            _id: mongoose.Types.ObjectId
            title: string
            slug: string
            description?: string
            thumbnailUrl?: string
            liveUrl?: string
            repoUrl?: string
            price?: number
            currency?: string
            categoryId?: { _id: mongoose.Types.ObjectId; name: string; slug: string; color?: string } | null
            technologies?: string[]
            features?: string[]
            isPublished: boolean
            isFeatured: boolean
            displayOrder: number
            createdAt: Date
        }>

        const transformed = typedProjects.map((p) => ({
            id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            description: p.description,
            thumbnailUrl: p.thumbnailUrl,
            liveUrl: p.liveUrl,
            repoUrl: p.repoUrl,
            price: p.price,
            currency: p.currency,
            category: p.categoryId ? { id: p.categoryId._id.toString(), name: p.categoryId.name, slug: p.categoryId.slug, color: p.categoryId.color } : null,
            technologies: p.technologies || [],
            features: p.features || [],
            isPublished: p.isPublished,
            isFeatured: p.isFeatured,
            displayOrder: p.displayOrder,
            createdAt: p.createdAt
        }))

        return NextResponse.json({
            projects: transformed,
            categories: (categories as unknown as Array<{ _id: mongoose.Types.ObjectId; name: string; slug: string; color?: string }>).map((c) => ({
                id: c._id.toString(),
                name: c.name,
                slug: c.slug,
                color: c.color
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })

    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await request.json()
        const { title, slug, description, thumbnailUrl, liveUrl, repoUrl, price, currency, categoryId, technologies, features, isPublished, isFeatured, displayOrder } = body

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
        }

        const existing = await Project.findOne({ slug })
        if (existing) {
            return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 400 })
        }

        const project = await Project.create({
            title, slug,
            description: description || '',
            thumbnailUrl: thumbnailUrl || '',
            liveUrl: liveUrl || '',
            repoUrl: repoUrl || '',
            price: price || 0,
            currency: currency || 'NPR',
            categoryId: categoryId || null,
            technologies: technologies || [],
            features: features || [],
            isPublished: isPublished || false,
            isFeatured: isFeatured || false,
            displayOrder: displayOrder || 0
        })

        return NextResponse.json({ success: true, project: { id: project._id.toString(), title: project.title, slug: project.slug } }, { status: 201 })

    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
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
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        if (updateFields.slug) {
            const existing = await Project.findOne({ slug: updateFields.slug, _id: { $ne: id } })
            if (existing) {
                return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 400 })
            }
        }

        const project = await Project.findByIdAndUpdate(id, updateFields, { new: true })
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, project: { id: project._id.toString(), title: project.title } })

    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
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
            return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
        }

        await dbConnect()

        const project = await Project.findByIdAndDelete(id)
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Project deleted' })

    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}
