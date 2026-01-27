import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb/client'
import { Post } from '@/lib/mongodb/models'
import mongoose from 'mongoose'

// Check if user is admin
async function isAdmin() {
    const session = await getServerSession(authOptions)
    return session?.user?.isAdmin === true
}

// GET - Get single post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        await dbConnect()

        const post = await Post.findById(id)
            .populate('categoryId', 'name slug')
            .lean()

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const typedPost = post as {
            _id: mongoose.Types.ObjectId
            title: string
            slug: string
            content: string
            excerpt?: string
            thumbnailUrl?: string
            categoryId?: { _id: mongoose.Types.ObjectId; name: string; slug: string } | null
            published: boolean
            createdAt: Date
            updatedAt: Date
        }

        return NextResponse.json({
            id: typedPost._id.toString(),
            title: typedPost.title,
            slug: typedPost.slug,
            content: typedPost.content,
            excerpt: typedPost.excerpt,
            thumbnailUrl: typedPost.thumbnailUrl,
            categoryId: typedPost.categoryId?._id?.toString() || null,
            category: typedPost.categoryId ? {
                id: typedPost.categoryId._id.toString(),
                name: typedPost.categoryId.name,
                slug: typedPost.categoryId.slug
            } : null,
            published: typedPost.published,
            createdAt: typedPost.createdAt,
            updatedAt: typedPost.updatedAt
        })

    } catch (error) {
        console.error('Error fetching post:', error)
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
    }
}

// PUT - Update post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        await dbConnect()

        const body = await request.json()
        const { title, slug, content, excerpt, thumbnailUrl, categoryId, published } = body

        // Check if slug is taken by another post
        if (slug) {
            const existingPost = await Post.findOne({ slug, _id: { $ne: id } })
            if (existingPost) {
                return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 })
            }
        }

        const updateData: Record<string, unknown> = {}
        if (title !== undefined) updateData.title = title
        if (slug !== undefined) updateData.slug = slug
        if (content !== undefined) updateData.content = content
        if (excerpt !== undefined) updateData.excerpt = excerpt
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl
        if (categoryId !== undefined) updateData.categoryId = categoryId || null
        if (published !== undefined) updateData.published = published

        const post = await Post.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            post: {
                id: post._id.toString(),
                title: post.title,
                slug: post.slug,
                published: post.published,
                updatedAt: post.updatedAt
            }
        })

    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }
}

// DELETE - Delete post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        await dbConnect()

        const post = await Post.findByIdAndDelete(id)

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            message: 'Post deleted successfully'
        })

    } catch (error) {
        console.error('Error deleting post:', error)
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }
}
