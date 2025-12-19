import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
    const supabase = await createClient()

    const { data: post } = await supabase
        .from('posts')
        .select('title, excerpt, content')
        .eq('slug', slug)
        .eq('published', true)
        .single()

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
    const supabase = await createClient()

    const { data: post } = await supabase
        .from('posts')
        .select(`
            *,
            post_categories (
                name,
                slug,
                color,
                icon_name
            )
        `)
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (!post) {
        notFound()
    }

    const categoryInfo = post.post_categories as any
    const CategoryIcon = categoryInfo?.icon_name && (Icons as any)[categoryInfo.icon_name]
        ? (Icons as any)[categoryInfo.icon_name]
        : Icons.Tag

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
                            <time dateTime={post.created_at}>
                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </time>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {post.featured_image_url && (
                        <div className="aspect-video w-full overflow-hidden rounded-xl bg-secondary mb-8">
                            <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
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
