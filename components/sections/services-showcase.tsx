'use client'

import { useEffect, useState } from 'react'

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
    category: string | null
    features: string[]
}

export function ServicesSection() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/services')
                if (response.ok) {
                    const data = await response.json()
                    setServices(data)
                }
            } catch (error) {
                console.error('Error fetching services:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchServices()
    }, [])

    if (loading) return null
    if (services.length === 0) return null

    return (
        <section className="relative py-24 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-primary">What We Offer</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Services</span>
                    </h2>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Transform your business with our comprehensive digital solutions designed to drive growth and innovation
                    </p>

                    <div className="flex items-center justify-center gap-2 mt-8">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-primary/50"></div>
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-primary/50"></div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => {
                        const IconComponent = service.icon_name && (Icons as any)[service.icon_name]
                            ? (Icons as any)[service.icon_name]
                            : Icons.Code

                        return (
                            <div
                                key={service.id}
                                className="group relative"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Card background with gradient border */}
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                                {/* Main Card */}
                                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 h-full flex flex-col hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
                                    {/* Icon with animated background */}
                                    <Link href={`/services/${service.slug}`} className="block mb-4">
                                        <div className="relative inline-flex">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/50 rounded-xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                                            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-xl group-hover:from-primary group-hover:to-primary/80 transition-all duration-500">
                                                <IconComponent className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-foreground mt-4 mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                                            {service.title}
                                        </h3>
                                    </Link>

                                    {/* Category Badge */}
                                    {service.category && (
                                        <span className="inline-block px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4 w-fit">
                                            {service.category}
                                        </span>
                                    )}

                                    {/* Spacer */}
                                    <div className="flex-1"></div>

                                    {/* Ask Button */}
                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                detail: { itemType: 'service', itemTitle: service.title }
                                            }))
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-primary/30 text-primary rounded-xl font-medium hover:bg-primary/10 hover:border-primary transition-all duration-300 text-sm group/btn"
                                    >
                                        <MessageSquare className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                        <span>Learn More</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* View All Button */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/services"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                    >
                        <span>View All Services</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
