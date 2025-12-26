'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, Check, MessageSquare } from 'lucide-react'
import * as Icons from 'lucide-react'
import { BuyButton } from '@/components/buy-button'

interface Service {
    id: string
    title: string
    slug: string
    description: string | null
    price: number
    currency: string
    icon_name: string | null
    features: string[]
}

export function ServicesSection() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchServices = async () => {
            const { data } = await supabase
                .from('services')
                .select('*')
                .eq('is_published', true)
                .order('display_order', { ascending: true })
                .limit(8)

            if (data) {
                setServices(data)
            }
            setLoading(false)
        }
        fetchServices()
    }, [supabase])

    if (loading) return null
    if (services.length === 0) return null

    return (
        <section className="py-20 bg-secondary/30">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Our Services</h2>
                        <p className="text-muted-foreground">Professional digital solutions for your business</p>
                    </div>
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View All Services
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service) => {
                        // Get icon from icon_name
                        const IconComponent = service.icon_name && (Icons as any)[service.icon_name]
                            ? (Icons as any)[service.icon_name]
                            : Icons.Code

                        return (
                            <div
                                key={service.id}
                                className="group relative bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm overflow-hidden"
                            >
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 group-hover:from-primary group-hover:to-primary/80 group-hover:scale-110 transition-all duration-500 shadow-lg">
                                        <IconComponent className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors truncate">
                                        {service.title}
                                    </h3>

                                    <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-5">
                                        {service.currency === 'USD' && '$'}
                                        {service.currency === 'EUR' && '€'}
                                        {service.currency === 'GBP' && '£'}
                                        {service.currency === 'NPR' && 'रू '}
                                        {service.price.toLocaleString()}
                                    </div>

                                    {/* {service.description && (
                                        <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                                            {service.description}
                                        </p>
                                    )} */}

                                    {/* {service.features && service.features.length > 0 && (
                                        <ul className="space-y-3 mb-6">
                                            {service.features.slice(0, 4).map((feature: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                                                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )} */}

                                    <BuyButton
                                        itemType="service"
                                        itemId={service.id}
                                        itemTitle={service.title}
                                        itemSlug={service.slug}
                                        amount={service.price}
                                        currency={service.currency}
                                        className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/50 transition-all duration-300"
                                    >
                                        Buy Now
                                    </BuyButton>

                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                detail: { itemType: 'service', itemTitle: service.title }
                                            }))
                                        }}
                                        className="w-full mt-3 flex items-center justify-center gap-2 py-3 border-2 border-primary/50 text-primary rounded-xl font-medium hover:bg-primary/10 hover:border-primary transition-all duration-300 backdrop-blur-sm"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        Ask About This Service
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
