import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Service } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

export async function GET(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status')

        const query: Record<string, unknown> = {}
        if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }]
        if (status === 'published') query.isPublished = true
        else if (status === 'draft') query.isPublished = false

        const [services, total] = await Promise.all([
            Service.find(query).sort({ displayOrder: 1 }).skip((page - 1) * limit).limit(limit).lean(),
            Service.countDocuments(query)
        ])

        const typedServices = services as Array<{
            _id: mongoose.Types.ObjectId
            title: string
            slug: string
            description?: string
            price?: number
            currency?: string
            iconName?: string
            features?: string[]
            category?: string
            isFeatured?: boolean
            isPublished?: boolean
            displayOrder?: number
        }>

        return NextResponse.json({
            services: typedServices.map((s) => ({
                id: s._id.toString(), title: s.title, slug: s.slug, description: s.description,
                price: s.price, currency: s.currency, iconName: s.iconName, features: s.features || [],
                category: s.category, isFeatured: s.isFeatured, isPublished: s.isPublished, displayOrder: s.displayOrder
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const body = await request.json()
        if (!body.title || !body.slug) return NextResponse.json({ error: 'Title and slug required' }, { status: 400 })
        const existing = await Service.findOne({ slug: body.slug })
        if (existing) return NextResponse.json({ error: 'Slug exists' }, { status: 400 })
        const service = await Service.create(body)
        return NextResponse.json({ success: true, service: { id: service._id.toString() } }, { status: 201 })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { id, ...updateFields } = await request.json()
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        const service = await Service.findByIdAndUpdate(id, updateFields, { new: true })
        if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const id = new URL(request.url).searchParams.get('id')
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        await dbConnect()
        const service = await Service.findByIdAndDelete(id)
        if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
