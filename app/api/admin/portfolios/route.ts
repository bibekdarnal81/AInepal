import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Portfolio } from '@/lib/mongodb/models'
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
        const status = searchParams.get('status')

        const query: Record<string, unknown> = {}
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }
        if (status === 'published') query.isPublished = true
        else if (status === 'draft') query.isPublished = false

        const skip = (page - 1) * limit

        const [portfolios, total] = await Promise.all([
            Portfolio.find(query).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
            Portfolio.countDocuments(query)
        ])

        const typedPortfolios = portfolios as Array<{
            _id: mongoose.Types.ObjectId
            title: string
            slug: string
            description?: string
            imageUrl?: string
            projectUrl?: string
            category?: string
            technologies?: string[]
            isFeatured: boolean
            isPublished: boolean
            displayOrder: number
            createdAt: Date
        }>

        return NextResponse.json({
            portfolios: typedPortfolios.map((p) => ({
                id: p._id.toString(),
                title: p.title,
                slug: p.slug,
                description: p.description,
                imageUrl: p.imageUrl,
                projectUrl: p.projectUrl,
                category: p.category,
                technologies: p.technologies || [],
                isFeatured: p.isFeatured,
                isPublished: p.isPublished,
                displayOrder: p.displayOrder,
                createdAt: p.createdAt
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })

    } catch (error) {
        console.error('Error fetching portfolios:', error)
        return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const body = await request.json()
        const { title, slug, description, imageUrl, projectUrl, category, technologies, isFeatured, isPublished, displayOrder } = body

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
        }

        const existing = await Portfolio.findOne({ slug })
        if (existing) {
            return NextResponse.json({ error: 'Portfolio with this slug already exists' }, { status: 400 })
        }

        const portfolio = await Portfolio.create({
            title, slug, description: description || '', imageUrl: imageUrl || '', projectUrl: projectUrl || '',
            category: category || '', technologies: technologies || [], isFeatured: isFeatured || false,
            isPublished: isPublished || false, displayOrder: displayOrder || 0
        })

        return NextResponse.json({ success: true, portfolio: { id: portfolio._id.toString(), title: portfolio.title } }, { status: 201 })

    } catch (error) {
        console.error('Error creating portfolio:', error)
        return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
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
            return NextResponse.json({ error: 'Invalid portfolio ID' }, { status: 400 })
        }

        if (updateFields.slug) {
            const existing = await Portfolio.findOne({ slug: updateFields.slug, _id: { $ne: id } })
            if (existing) {
                return NextResponse.json({ error: 'Portfolio with this slug already exists' }, { status: 400 })
            }
        }

        const portfolio = await Portfolio.findByIdAndUpdate(id, updateFields, { new: true })
        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, portfolio: { id: portfolio._id.toString(), title: portfolio.title } })

    } catch (error) {
        console.error('Error updating portfolio:', error)
        return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 })
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
            return NextResponse.json({ error: 'Invalid portfolio ID' }, { status: 400 })
        }

        await dbConnect()
        const portfolio = await Portfolio.findByIdAndDelete(id)
        if (!portfolio) {
            return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Portfolio deleted' })

    } catch (error) {
        console.error('Error deleting portfolio:', error)
        return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 })
    }
}
