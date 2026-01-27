
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Class } from '@/lib/mongodb/models/Class'
import { User } from '@/lib/mongodb/models/User'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findById(session.user.id)
        if (!user || (!user.isAdmin && user.email !== 'admin@example.com')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const isActive = searchParams.get('isActive')

        const query: any = {}
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { instructor: { $regex: search, $options: 'i' } }
            ]
        }
        if (isActive !== null && isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true'
        }

        const skip = (page - 1) * limit

        const [classes, total] = await Promise.all([
            Class.find(query)
                .sort({ displayOrder: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Class.countDocuments(query)
        ])

        return NextResponse.json({
            classes,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error: any) {
        console.error('Error fetching classes:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        // Verify Admin
        const user = await User.findById(session.user.id)
        if (!user || (!user.isAdmin && user.email !== 'admin@example.com')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()

        // Allow manual slug or auto-generate
        if (!body.slug) {
            body.slug = body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
        }

        // Check availability of slug
        const existingClass = await Class.findOne({ slug: body.slug })
        if (existingClass) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
        }

        const newClass = await Class.create(body)

        return NextResponse.json(newClass, { status: 201 })

    } catch (error: any) {
        console.error('Error creating class:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
