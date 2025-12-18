import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

export async function PostsSection() {
    const supabase = await createClient()

    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3)

    if (!posts || posts.length === 0) return null

    return (
        <section className="py-20 bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Latest Blog Posts</h2>
                        <p className="text-muted-foreground">Insights, tutorials, and updates from our blog</p>
                    </div>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View All Posts
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            {post.thumbnail_url && (
                                <div className="aspect-video w-full overflow-hidden bg-secondary">
                                    <img
                                        src={post.thumbnail_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Calendar className="h-4 w-4" />
                                    <time>{new Date(post.created_at).toLocaleDateString()}</time>
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h3>
                                {post.excerpt && (
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                )}
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                                >
                                    Read More
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
