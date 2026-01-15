'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { LayoutTemplate, Tag, Code2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Template {
    id: string
    title: string
    slug: string
    summary: string | null
    description: string | null
    image_url: string | null
    demo_url: string | null
    category: string | null
    tags: string[]
    tech_stack: string[]
    price: number
    currency: string
    is_featured: boolean
}

export default function TemplateDeployPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchTemplates = async () => {
            const { data, error } = await supabase
                .from('templates')
                .select('*')
                .eq('is_published', true)
                .order('display_order', { ascending: true })

            if (error) {
                console.error('Error fetching templates:', error)
            } else if (data) {
                setTemplates(data as Template[])
            }
            setLoading(false)
        }

        fetchTemplates()
    }, [])

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                            <LayoutTemplate className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground mb-3">
                            Ready-made Templates
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Pick a template and launch faster with a pre-built setup
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-10 text-center">
                            <p className="text-muted-foreground">No templates published yet.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
                                >
                                    <div className="aspect-video bg-secondary overflow-hidden">
                                        {template.image_url ? (
                                            <img
                                                src={template.image_url}
                                                alt={template.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <LayoutTemplate className="w-10 h-10" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-semibold text-foreground">{template.title}</h3>
                                                {template.is_featured && (
                                                    <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            {template.summary && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {template.summary}
                                                </p>
                                            )}
                                            {template.category && (
                                                <p className="text-xs text-primary uppercase tracking-wide">{template.category}</p>
                                            )}
                                        </div>

                                        {template.tags && template.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                {template.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary">
                                                        <Tag className="w-3 h-3" />
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {template.tech_stack && template.tech_stack.length > 0 && (
                                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                {template.tech_stack.slice(0, 3).map((tech) => (
                                                    <span key={tech} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary">
                                                        <Code2 className="w-3 h-3" />
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-lg font-semibold text-foreground">
                                                {template.currency === 'NPR' ? 'रू' : '$'} {template.price?.toLocaleString('en-NP')}
                                            </div>
                                            {template.demo_url && (
                                                <a
                                                    href={template.demo_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Live demo
                                                </a>
                                            )}
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            <Link
                                                href={`/projects/new?template=${template.slug}`}
                                                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                Use template
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-10 text-center">
                        <Link
                            href="/projects/new"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Back to deployment options
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
