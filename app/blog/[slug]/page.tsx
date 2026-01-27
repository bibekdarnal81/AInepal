import dbConnect from '@/lib/mongodb/client'
import { Post, PostCategory } from '@/lib/mongodb/models'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import * as Icons from 'lucide-react'

export const revalidate = 60

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    await dbConnect()

    const post = await Post.findOne({ slug, isPublished: true }).select('title excerpt content').lean()

    if (!post) {
        return { title: 'Post Not Found' }
    }

    return {
        title: post.title,
        description: post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || post.title,
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    await dbConnect()

    const post = await Post.findOne({ slug, isPublished: true })
        .populate({
            path: 'categoryId',
            model: PostCategory,
            select: 'name slug color iconName'
        })
        .lean() as {
            _id: string
            title: string
            excerpt?: string
            content?: string
            createdAt: Date
            featuredImageUrl?: string
            categoryId?: {
                _id: string
                name: string
                slug: string
                color?: string
                iconName?: string
            } | null
        } | null

    if (!post) {
        notFound()
    }

    const categoryInfo = post.categoryId
    const iconName = categoryInfo?.iconName as keyof typeof Icons | undefined
    const CategoryIcon = (iconName && iconName in Icons
        ? Icons[iconName]
        : Icons.Tag) as any

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-12">
                <article className="max-w-4xl mx-auto px-6 lg:px-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>

                    {/* Category Badge */}
                    {categoryInfo && (
                        <div className="mb-6">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                                style={{
                                    backgroundColor: `${categoryInfo.color}20`,
                                    color: categoryInfo.color
                                }}
                            >
                                <CategoryIcon className="h-4 w-4" />
                                {categoryInfo.name}
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="text-xl text-muted-foreground mb-4">
                                {post.excerpt}
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.createdAt.toString()}>
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featuredImageUrl && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-secondary mb-8">
                            <Image
                                src={post.featuredImageUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1200px) 100vw, 1200px"
                                priority
                            />
                        </div>
                    )}

                    {/* Content */}
                    {post.content && (
                        <div
                            className="prose prose-lg prose-invert max-w-none
                                prose-headings:text-foreground prose-headings:font-bold
                                prose-p:text-foreground/90 prose-p:leading-relaxed
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-foreground prose-strong:font-semibold
                                prose-ul:text-foreground/90 prose-ol:text-foreground/90
                                prose-li:text-foreground/90
                                prose-blockquote:text-foreground/80 prose-blockquote:border-primary
                                prose-code:text-primary prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                                prose-pre:bg-secondary prose-pre:border prose-pre:border-border
                                prose-img:rounded-lg prose-img:border prose-img:border-border"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    )}
                </article>
            </main>
            <Footer />
        </div>
    )
}
