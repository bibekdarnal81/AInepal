'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BuyButton } from '@/components/buy-button'
import * as Icons from 'lucide-react'
import { Check, MessageSquare, ArrowLeft, Clock, Award, Zap } from 'lucide-react'
import Link from 'next/link'

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
    is_featured: boolean
    is_published: boolean
    created_at: string
}

export default function ServiceDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [service, setService] = useState<Service | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchService = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('slug', params.slug)
                .eq('is_published', true)
                .single()

            if (error || !data) {
                router.push('/services')
            } else {
                setService(data)
            }
            setLoading(false)
        }
        fetchService()
    }, [params.slug, router, supabase])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!service) return null

    const IconComponent = service.icon_name && (Icons as any)[service.icon_name]
        ? (Icons as any)[service.icon_name]
        : Icons.Code

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                        <Link
                            href="/services"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Services
                        </Link>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-6 mb-6">
                                    <IconComponent className="h-16 w-16 text-primary" />
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                                    {service.title}
                                </h1>

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

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <BuyButton
                                        itemType="service"
                                        itemId={service.id}
                                        itemTitle={service.title}
                                        itemSlug={service.slug}
                                        amount={service.price}
                                        currency={service.currency}
                                        className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/50 transition-all duration-300"
                                    >
                                        Get Started Now
                                    </BuyButton>

                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                detail: { itemType: 'service', itemTitle: service.title }
                                            }))
                                        }}
                                        className="px-8 py-4 text-lg flex items-center justify-center gap-2 border-2 border-primary/50 text-primary rounded-xl font-medium hover:bg-primary/10 hover:border-primary transition-all duration-300"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        Ask Questions
                                    </button>
                                </div>
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
                            <BuyButton
                                itemType="service"
                                itemId={service.id}
                                itemTitle={service.title}
                                itemSlug={service.slug}
                                amount={service.price}
                                currency={service.currency}
                                className="px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100 shadow-xl transition-all duration-300"
                            >
                                Purchase Now
                            </BuyButton>
                            <button
                                onClick={() => {
                                    window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                        detail: { itemType: 'service', itemTitle: service.title }
                                    }))
                                }}
                                className="px-8 py-4 text-lg flex items-center justify-center gap-2 border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-all duration-300"
                            >
                                <MessageSquare className="h-5 w-5" />
                                Contact Us
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
