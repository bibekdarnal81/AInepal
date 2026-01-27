'use client'

import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface Portfolio {
    id: string
    title: string
    slug: string
    description: string | null
    image_url: string | null
    client_name: string | null
    category: string | null
    technologies: string[]
    project_url: string | null
    is_featured: boolean
    display_order: number
}

export function PortfoliosSection() {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPortfolios = async () => {
            try {
                const response = await fetch('/api/portfolios')
                if (response.ok) {
                    const data = await response.json()
                    setPortfolios(data)
                }
            } catch (error) {
                console.error('Error fetching portfolios:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchPortfolios()
    }, [])

    if (loading) {
        return (
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="animate-pulse">
                            <div className="h-8 bg-secondary rounded w-64 mx-auto mb-4"></div>
                            <div className="h-4 bg-secondary rounded w-96 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (portfolios.length === 0) {
        return null
    }

    return (
        <section className="py-20 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Beautiful Portfolios
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Showcase of our best work and creative projects delivered to amazing clients
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                    {portfolios.map((portfolio, index) => (
                        <motion.div
                            key={portfolio.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative h-full"
                        >
                            <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 h-full flex flex-col">
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                                    {portfolio.image_url ? (
                                        <>
                                            <Image
                                                src={portfolio.image_url}
                                                alt={portfolio.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                                                {portfolio.project_url && (
                                                    <a
                                                        href={portfolio.project_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        View Live
                                                    </a>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-3 flex-1 flex flex-col">
                                    <div>
                                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {portfolio.title}
                                        </h3>
                                        {portfolio.client_name && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Client: {portfolio.client_name}
                                            </p>
                                        )}
                                        {portfolio.category && (
                                            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                                {portfolio.category}
                                            </span>
                                        )}
                                    </div>

                                    {/* {portfolio.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {portfolio.description}
                                        </p>
                                    )} */}

                                    {portfolio.technologies && portfolio.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {portfolio.technologies.slice(0, 3).map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                            {portfolio.technologies.length > 3 && (
                                                <span className="px-2 py-1 text-xs bg-secondary text-muted-foreground rounded">
                                                    +{portfolio.technologies.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
