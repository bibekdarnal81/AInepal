import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogPage() {
    const supabase = await createClient()
    
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="mb-12">
                    <Link href="/" className="text-primary hover:text-primary/80 transition-colors mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-foreground">Blog</h1>
                    <p className="text-muted-foreground mt-2">Latest posts and updates</p>
                </div>

                <div className="space-y-8">
                    {!posts || posts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <article 
                                key={post.id}
                                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                            >
                                <Link href={`/blog/${post.slug}`}>
                                    <h2 className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>
                                </Link>
                                <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={post.created_at}>
                                        {new Date(post.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </time>
                                </div>
                                {post.content && (
                                    <p className="text-muted-foreground mt-4 line-clamp-3">
                                        {post.content.substring(0, 200)}...
                                    </p>
                                )}
                                <Link 
                                    href={`/blog/${post.slug}`}
                                    className="inline-block mt-4 text-primary hover:text-primary/80 transition-colors"
                                >
                                    Read more →
                                </Link>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
