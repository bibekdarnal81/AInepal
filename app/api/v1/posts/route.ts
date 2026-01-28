import { NextRequest, NextResponse } from 'next/server'

import { verifyApiKey } from '@/lib/auth/verifyApiKey'
import dbConnect from '@/lib/mongodb/client'
import { Post, PostCategory, IPost, IPostCategory } from '@/lib/mongodb/models'
import { IUserApiKey } from '@/lib/mongodb/models/UserApiKey'

export async function GET(request: NextRequest) {
    // 1. Verify API Key
    const user = await verifyApiKey(request)
    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized. Invalid or missing API Key.' },
            { status: 401 }
        )
    }

    try {
        await dbConnect()

        // 2. Parse Query Params
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const categorySlug = searchParams.get('category')
        const search = searchParams.get('search') || ''

        // 3. Build Query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = { published: true } // Only published posts for public API

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ]
        }

        if (categorySlug) {
            const category = await PostCategory.findOne({ slug: categorySlug })
            if (category) {
                query.categoryId = category._id
            } else {
                return NextResponse.json({ posts: [], total: 0, page, limit }, { status: 200 })
            }
        }

        const skip = (page - 1) * limit

        // 4. Fetch Data
        const [posts, total] = await Promise.all([
            Post.find(query)
                .populate('categoryId', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Post.countDocuments(query)
        ])

        // 5. Transform Data
        const transformedPosts = (posts as unknown as (IPost & { categoryId?: IPostCategory })[]).map((post) => ({
            id: post._id.toString(),
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            thumbnailUrl: post.thumbnailUrl,
            category: post.categoryId ? {
                id: post.categoryId._id.toString(),
                name: post.categoryId.name,
                slug: post.categoryId.slug
            } : null,
            publishedAt: post.createdAt,
            url: `${request.nextUrl.origin}/blog/${post.slug}`
        }))

        // 6. Return Response
        return NextResponse.json({
            success: true,
            data: transformedPosts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
