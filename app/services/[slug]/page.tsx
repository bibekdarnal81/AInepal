import { notFound } from 'next/navigation'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import * as Icons from 'lucide-react'
import { Check, Clock, Award, Zap, ArrowLeft, ArrowRight } from 'lucide-react'
import { ServiceHeroActions } from '@/components/services/service-hero-actions'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

interface Service {
    id: string
    title: string
    slug: string
    description: string | null
    content: string | null
    price: number
    currency: string
    icon_name: string | null
    thumbnail_url: string | null
    features: string[]
    category: string | null
    subcategory: string | null
    is_featured: boolean
    is_published: boolean
    created_at: string
    updated_at: string
}

import dbConnect from '@/lib/mongodb/client'
import { Service } from '@/lib/mongodb/models'

async function getService(slug: string) {
    await dbConnect()
    const service = await Service.findOne({ slug, isPublished: true }).lean()

    if (!service) {
        return null
    }

    return {
        id: service._id.toString(),
        title: service.title,
        slug: service.slug,
        description: service.description || null,
        content: service.content || null,
        price: service.price,
        currency: service.currency,
        icon_name: service.iconName || null,
        thumbnail_url: service.thumbnailUrl || null,
        features: service.features || [],
        category: service.category || null,
        subcategory: service.subcategory || null,
        is_featured: service.isFeatured,
        is_published: service.isPublished,
        created_at: service.createdAt.toISOString(),
        updated_at: service.updatedAt.toISOString(),
    } as Service
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const service = await getService(slug)

    if (!service) {
        return {
            title: 'Service Not Found',
            description: 'The requested service could not be found.',
        }
    }

    const title = `${service.title} | AINepal Services`
    const description = service.description || `Explore our ${service.title} service. Professional solutions for your business.`
    const ogImage = service.thumbnail_url || '/og-services.jpg'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: service.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
        },
    }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const service = await getService(slug)

    if (!service) {
        return notFound()
    }

    const iconName = service.icon_name as keyof typeof Icons | undefined
    const IconComponent = (iconName && iconName in Icons
        ? Icons[iconName]
        : Icons.Code) as any

    // Structured Data (JSON-LD)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: {
            '@type': 'Organization',
            name: 'AINepal',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://AINepal.tech'
        },
        offers: {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: service.currency
        },
        serviceType: service.category || 'Digital Service',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/services/${service.slug}`,
        image: service.thumbnail_url
    }

    return (
        <div className="min-h-screen bg-background text-primary font-sans selection:bg-primary/20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <Link href="/services" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-12">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Services
                        </Link>

                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center justify-center rounded-2xl bg-card border border-border/60 p-6 mb-8 shadow-2xl">
                                    <IconComponent className="h-12 w-12 text-blue-400" />
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                                    {service.title}
                                </h1>

                                {service.category && (
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                                            {service.category}
                                        </span>
                                        {service.subcategory && (
                                            <span className="inline-block px-3 py-1 text-sm font-medium bg-secondary text-secondary border border-border/60 rounded-full">
                                                {service.subcategory}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {service.description && (
                                    <p className="text-lg text-muted leading-relaxed mb-10">
                                        {service.description}
                                    </p>
                                )}

                                <div className="flex items-end gap-2 mb-10">
                                    <div className="text-4xl font-bold text-primary">
                                        {service.currency === 'USD' && '$'}
                                        {service.currency === 'EUR' && '€'}
                                        {service.currency === 'GBP' && '£'}
                                        {service.currency === 'NPR' && 'रू '}
                                        {service.price.toLocaleString()}
                                    </div>
                                    <div className="text-lg text-muted mb-1">/ starting price</div>
                                </div>

                                {/* Custom styles for the actions component will need to handle dark mode if they don't already */}
                                <ServiceHeroActions service={service} />
                            </div>

                            {service.thumbnail_url && (
                                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/60 group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                    <Image
                                        src={service.thumbnail_url}
                                        alt={service.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                                        priority
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                {service.features && service.features.length > 0 && (
                    <section className="py-20 relative">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
                                What&apos;s Included
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {service.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-6 bg-card backdrop-blur-sm rounded-2xl border border-border/60 hover:border-blue-500/30 hover:bg-card/80 transition-all duration-300 group"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                            <Check className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-secondary font-medium leading-relaxed">{feature}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Content Section */}
                {service.content && (
                    <section className="py-20">
                        <div className="max-w-4xl mx-auto px-6 lg:px-8">
                            <div
                                className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-muted prose-strong:text-primary prose-ul:text-muted prose-li:marker:text-blue-500 dark:prose-invert"
                                dangerouslySetInnerHTML={{ __html: service.content }}
                            />
                        </div>
                    </section>
                )}

                {/* Why Choose Us */}
                <section className="py-24 bg-secondary/30 border-y border-border/60">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-primary mb-16 text-center">
                            Why Choose This Service
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-8 bg-card rounded-3xl border border-border/60 hover:border-border transition-colors">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mb-6 border border-blue-500/20">
                                    <Zap className="h-8 w-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-4">Fast Delivery</h3>
                                <p className="text-muted leading-relaxed">
                                    Quick turnaround time without compromising on quality. We value your time.
                                </p>
                            </div>

                            <div className="text-center p-8 bg-card rounded-3xl border border-border/60 hover:border-border transition-colors">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mb-6 border border-purple-500/20">
                                    <Award className="h-8 w-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-4">Premium Quality</h3>
                                <p className="text-muted leading-relaxed">
                                    Professional-grade work that exceeds expectations. We strive for excellence.
                                </p>
                            </div>

                            <div className="text-center p-8 bg-card rounded-3xl border border-border/60 hover:border-border transition-colors">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-6 border border-green-500/20">
                                    <Clock className="h-8 w-8 text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-4">24/7 Support</h3>
                                <p className="text-muted leading-relaxed">
                                    Always available to help with your questions. We are here when you need us.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold text-primary mb-8 tracking-tight">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-muted mb-12 max-w-2xl mx-auto">
                            Let&apos;s bring your project to life with our {service.title} service.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/book-demo" className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                                Book a Consultation <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
