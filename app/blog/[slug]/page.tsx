import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'

export const revalidate = 60

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()
    
    const { data: post } = await supabase
        .from('posts')
        .select('title, content')
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (!post) {
        return { title: 'Post Not Found' }
    }

    return {
        title: post.title,
        description: post.content?.substring(0, 160) || post.title,
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()
    
    const { data: post } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <article className="max-w-3xl mx-auto px-4 py-16">
                <Link 
                    href="/blog"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Blog
                </Link>

                <header className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-4 text-muted-foreground">
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

                <div className="prose prose-invert max-w-none">
                    {post.content?.split('\n').map((paragraph: string, index: number) => (
                        paragraph.trim() && (
                            <p key={index} className="text-foreground/80 leading-relaxed mb-4">
                                {paragraph}
                            </p>
                        )
                    ))}
                </div>
            </article>
        </div>
    )
}
