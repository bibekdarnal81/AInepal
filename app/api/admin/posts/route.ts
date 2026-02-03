import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/options'
import dbConnect from '@/lib/mongodb/client'
import { Post, PostCategory } from '@/lib/mongodb/models'

// Check if user is admin
async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

// GET - List all posts
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
        const status = searchParams.get('status') // published, draft, all

        // Build query
        const query: Record<string, unknown> = {}
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ]
        }
        if (categoryId) {
            query.categoryId = categoryId
        }
        if (status === 'published') {
            query.published = true
        } else if (status === 'draft') {
            query.published = false
        }

        const skip = (page - 1) * limit

        const [posts, total, categories] = await Promise.all([
            Post.find(query)
                .populate('categoryId', 'name slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Post.countDocuments(query),
            PostCategory.find().sort({ name: 1 }).lean()
        ])

        const typedPosts = posts as unknown as Array<{
            _id: string
            title: string
            slug: string
            excerpt?: string
            thumbnailUrl?: string
            categoryId?: { _id: string; name: string; slug: string } | null
            published: boolean
            createdAt: Date
            updatedAt: Date
        }>
        const transformedPosts = typedPosts.map((post) => ({
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
            published: post.published,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt
        }))

        return NextResponse.json({
            posts: transformedPosts,
            categories: (categories as unknown as Array<{ _id: string; name: string; slug: string }>).map((c) => ({
                id: c._id.toString(),
                name: c.name,
                slug: c.slug
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('Error fetching posts:', error)
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}

// POST - Create new post
export async function POST(request: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()

        const body = await request.json()
        const { title, slug, content, excerpt, thumbnailUrl, categoryId, published } = body

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
        }

        // Check if slug already exists
        const existingPost = await Post.findOne({ slug })
        if (existingPost) {
            return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 })
        }

        const post = await Post.create({
            title,
            slug,
            content: content || '',
            excerpt: excerpt || '',
            thumbnailUrl: thumbnailUrl || '',
            categoryId: categoryId || null,
            published: published || false
        })

        return NextResponse.json({
            success: true,
            post: {
                id: post._id.toString(),
                title: post.title,
                slug: post.slug,
                published: post.published,
                createdAt: post.createdAt
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
}
