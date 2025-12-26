import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import * as Icons from 'lucide-react'
import { Check, Clock, Award, Zap } from 'lucide-react'
import { ServiceHeroActions } from '@/components/services/service-hero-actions'
import { ServiceBackLink } from '@/components/services/service-back-link'
import { Metadata } from 'next'

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

async function getService(slug: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (error || !data) {
        return null
    }

    return data as Service
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

    const title = `${service.title} | Rusha Services`
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

    const IconComponent = service.icon_name && (Icons as any)[service.icon_name]
        ? (Icons as any)[service.icon_name]
        : Icons.Code

    // Structured Data (JSON-LD)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        description: service.description,
        provider: {
            '@type': 'Organization',
            name: 'Rusha',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://rusha.co'
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
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                        <ServiceBackLink />

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-6 mb-6">
                                    <IconComponent className="h-16 w-16 text-primary" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                                    {service.title}
                                </h1>

                                {service.category && (
                                    <div className="flex gap-2 mb-6">
                                        <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                                            {service.category}
                                        </span>
                                        {service.subcategory && (
                                            <span className="inline-block px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground rounded-full">
                                                {service.subcategory}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {service.description && (
                                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                                        {service.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-6 mb-8">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                                        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                            {service.currency === 'USD' && '$'}
                                            {service.currency === 'EUR' && '€'}
                                            {service.currency === 'GBP' && '£'}
                                            {service.currency === 'NPR' && 'रू '}
                                            {service.price.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <ServiceHeroActions service={service} />
                            </div>

                            {service.thumbnail_url && (
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src={service.thumbnail_url}
                                        alt={service.title}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                {service.features && service.features.length > 0 && (
                    <section className="py-20 bg-card/50">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8">
                            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
                                What's Included
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {service.features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Check className="h-6 w-6 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-foreground font-medium">{feature}</p>
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
                                className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: service.content }}
                            />
                        </div>
                    </section>
                )}

                {/* Why Choose Us */}
                <section className="py-20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
                            Why Choose This Service
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-8 bg-card rounded-2xl border border-border">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                    <Zap className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Fast Delivery</h3>
                                <p className="text-muted-foreground">
                                    Quick turnaround time without compromising on quality
                                </p>
                            </div>

                            <div className="text-center p-8 bg-card rounded-2xl border border-border">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                    <Award className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">Premium Quality</h3>
                                <p className="text-muted-foreground">
                                    Professional-grade work that exceeds expectations
                                </p>
                            </div>

                            <div className="text-center p-8 bg-card rounded-2xl border border-border">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                                    <Clock className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">24/7 Support</h3>
                                <p className="text-muted-foreground">
                                    Always available to help with your questions
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-white/90 mb-10">
                            Let's bring your project to life with {service.title}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <ServiceHeroActions service={service} variant="white" />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
