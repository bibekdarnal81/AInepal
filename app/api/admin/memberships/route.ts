import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Membership } from '@/lib/mongodb/models'
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
        const status = searchParams.get('status') || 'all'

        const query: Record<string, unknown> = {}
        if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { slug: { $regex: search, $options: 'i' } }]
        if (status === 'active') query.isActive = true
        if (status === 'inactive') query.isActive = false

        const [memberships, total] = await Promise.all([
            Membership.find(query).sort({ sortOrder: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Membership.countDocuments(query),
        ])

        const typedMemberships = memberships as Array<{
            _id: mongoose.Types.ObjectId
            name: string
            slug: string
            description?: string
            price: number
            priceMonthly?: number
            priceYearly?: number
            yearlyDiscountPercent?: number
            discount?: number
            currency: string
            durationDays: number
            features?: string[]
            featureCategories?: unknown[]
            advancedCredits?: number
            appIntegrationIcons?: string[]
            platformIcons?: string[]
            badgeText?: string
            iconName?: string
            imageUrl?: string
            additionalSections?: unknown[]
            isActive: boolean
            sortOrder: number
            createdAt: Date
        }>

        return NextResponse.json({
            memberships: typedMemberships.map((m) => ({
                id: m._id.toString(),
                name: m.name,
                slug: m.slug,
                description: m.description,
                price: m.price,
                priceMonthly: m.priceMonthly,
                priceYearly: m.priceYearly,
                yearlyDiscountPercent: m.yearlyDiscountPercent,
                discount: m.discount, // Added
                currency: m.currency,
                durationDays: m.durationDays,
                features: m.features || [],
                featureCategories: m.featureCategories || [], // Added
                advancedCredits: m.advancedCredits, // Added
                appIntegrationIcons: m.appIntegrationIcons || [], // Added
                platformIcons: m.platformIcons || [], // Added
                badgeText: m.badgeText, // Added
                iconName: m.iconName,
                imageUrl: m.imageUrl,
                additionalSections: m.additionalSections || [],
                isActive: m.isActive,
                sortOrder: m.sortOrder,
                createdAt: m.createdAt,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const body = await request.json()
        const {
            name, slug, description, price, priceMonthly, priceYearly, yearlyDiscountPercent,
            discount, currency, durationDays, features, featureCategories, // Added featureCategories
            advancedCredits, appIntegrationIcons, platformIcons, badgeText, // Added new fields
            iconName, imageUrl, additionalSections, isActive, sortOrder
        } = body

        if (!name || !slug) return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })

        const membership = await Membership.create({
            name,
            slug,
            description,
            price: Number(price) || 0,
            priceMonthly: priceMonthly === '' || priceMonthly === null || priceMonthly === undefined ? undefined : Number(priceMonthly),
            priceYearly: priceYearly === '' || priceYearly === null || priceYearly === undefined ? undefined : Number(priceYearly),
            yearlyDiscountPercent: yearlyDiscountPercent === '' || yearlyDiscountPercent === null || yearlyDiscountPercent === undefined ? undefined : Number(yearlyDiscountPercent),
            discount: discount === '' || discount === null || discount === undefined ? undefined : Number(discount), // Added
            currency: currency || 'USD',
            durationDays: Number(durationDays) || 30,
            features: Array.isArray(features) ? features : [],
            featureCategories: Array.isArray(featureCategories) ? featureCategories : [], // Added
            advancedCredits: advancedCredits ? Number(advancedCredits) : undefined, // Added
            appIntegrationIcons: Array.isArray(appIntegrationIcons) ? appIntegrationIcons : [], // Added
            platformIcons: Array.isArray(platformIcons) ? platformIcons : [], // Added
            badgeText, // Added
            iconName,
            imageUrl,
            additionalSections: Array.isArray(additionalSections) ? additionalSections : [],
            isActive: typeof isActive === 'boolean' ? isActive : true,
            sortOrder: Number(sortOrder) || 0,
        })

        return NextResponse.json({ id: membership._id.toString() })
    } catch (error: unknown) {
        console.error('Error:', error)
        const errorCode = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined
        if (errorCode === 11000) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()

        const body = await request.json()
        const { id, ...updates } = body
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

        const updateData: Record<string, unknown> = {}
        if (updates.name !== undefined) updateData.name = updates.name
        if (updates.slug !== undefined) updateData.slug = updates.slug
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.price !== undefined) updateData.price = Number(updates.price) || 0
        if (updates.priceMonthly !== undefined) {
            updateData.priceMonthly = updates.priceMonthly === '' || updates.priceMonthly === null ? undefined : Number(updates.priceMonthly)
        }
        if (updates.priceYearly !== undefined) {
            updateData.priceYearly = updates.priceYearly === '' || updates.priceYearly === null ? undefined : Number(updates.priceYearly)
        }
        if (updates.yearlyDiscountPercent !== undefined) {
            updateData.yearlyDiscountPercent = updates.yearlyDiscountPercent === '' || updates.yearlyDiscountPercent === null ? undefined : Number(updates.yearlyDiscountPercent)
        }
        if (updates.discount !== undefined) {
            updateData.discount = updates.discount === '' || updates.discount === null ? undefined : Number(updates.discount)
        }
        if (updates.currency !== undefined) updateData.currency = updates.currency
        if (updates.durationDays !== undefined) updateData.durationDays = Number(updates.durationDays) || 30
        if (updates.features !== undefined) updateData.features = Array.isArray(updates.features) ? updates.features : []
        if (updates.featureCategories !== undefined) updateData.featureCategories = Array.isArray(updates.featureCategories) ? updates.featureCategories : [] // Added
        if (updates.advancedCredits !== undefined) updateData.advancedCredits = updates.advancedCredits ? Number(updates.advancedCredits) : undefined // Added
        if (updates.appIntegrationIcons !== undefined) updateData.appIntegrationIcons = Array.isArray(updates.appIntegrationIcons) ? updates.appIntegrationIcons : [] // Added
        if (updates.platformIcons !== undefined) updateData.platformIcons = Array.isArray(updates.platformIcons) ? updates.platformIcons : [] // Added
        if (updates.badgeText !== undefined) updateData.badgeText = updates.badgeText // Added
        if (updates.iconName !== undefined) updateData.iconName = updates.iconName
        if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl
        if (updates.additionalSections !== undefined) updateData.additionalSections = Array.isArray(updates.additionalSections) ? updates.additionalSections : []
        if (updates.isActive !== undefined) updateData.isActive = updates.isActive
        if (updates.sortOrder !== undefined) updateData.sortOrder = Number(updates.sortOrder) || 0

        const membership = await Membership.findByIdAndUpdate(id, updateData, { new: true })
        if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Error:', error)
        const errorCode = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: number }).code : undefined
        if (errorCode === 11000) return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

        await Membership.findByIdAndDelete(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
