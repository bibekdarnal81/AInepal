import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import * as Icons from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogPage() {
    const supabase = await createClient()

    const { data: posts } = await supabase
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
        .eq('published', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="py-12">
                <div className="max-w-5xl mx-auto px-6 lg:px-8">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Blog</h1>
                        <p className="text-xl text-muted-foreground">Latest posts, tutorials, and insights</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {!posts || posts.length === 0 ? (
                            <div className="col-span-2 text-center py-16">
                                <p className="text-muted-foreground">No posts yet. Check back soon!</p>
                            </div>
                        ) : (
                            posts.map((post) => {
                                const categoryInfo = post.post_categories as any
                                const CategoryIcon = categoryInfo?.icon_name && (Icons as any)[categoryInfo.icon_name]
                                    ? (Icons as any)[categoryInfo.icon_name]
                                    : Icons.Tag

                                return (
                                    <article
                                        key={post.id}
                                        className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg group"
                                    >
                                        {/* Featured Image */}
                                        {post.featured_image_url && (
                                            <Link href={`/blog/${post.slug}`}>
                                                <div className="aspect-video w-full overflow-hidden bg-secondary">
                                                    <img
                                                        src={post.featured_image_url}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </div>
                                            </Link>
                                        )}

                                        <div className="p-6 space-y-4">
                                            {/* Category Badge */}
                                            {categoryInfo && (
                                                <div
                                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium"
                                                    style={{
                                                        backgroundColor: `${categoryInfo.color}20`,
                                                        color: categoryInfo.color
                                                    }}
                                                >
                                                    <CategoryIcon className="h-3.5 w-3.5" />
                                                    {categoryInfo.name}
                                                </div>
                                            )}

                                            {/* Title */}
                                            <Link href={`/blog/${post.slug}`}>
                                                <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h2>
                                            </Link>

                                            {/* Excerpt or Content Preview */}
                                            {(post.excerpt || post.content) && (
                                                <p className="text-muted-foreground line-clamp-3">
                                                    {post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
                                                </p>
                                            )}

                                            {/* Date and Read More */}
                                            <div className="flex items-center justify-between pt-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <time dateTime={post.created_at}>
                                                        {new Date(post.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </time>
                                                </div>
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                                                >
                                                    Read more →
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
