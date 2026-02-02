'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, MessageSquare } from 'lucide-react'
import * as Icons from 'lucide-react'

interface Service {
    id: string
    title: string
    slug: string
    description: string | null
    price: number
    currency: string
    icon_name: string | null
    image_url?: string | null
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

    if (loading || services.length === 0) return null

    return (
        <section className="relative py-24 overflow-hidden bg-background">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2"></div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20"
                    >
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">Expertise & Innovation</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-6xl font-extrabold text-foreground mb-6"
                    >
                        Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Services</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                    >
                        We combine cutting-edge technology with strategic thinking to deliver
                        exceptional digital experiences that drive real business results.
                    </motion.p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => {
                        const IconComponent = (service.icon_name && service.icon_name in Icons
                            ? Icons[service.icon_name as keyof typeof Icons]
                            : Icons.Code) as React.ElementType

                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative"
                            >
                                <div className="relative h-full bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.15)] flex flex-col">
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        {service.image_url ? (
                                            <Image
                                                src={service.image_url}
                                                alt={service.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                <IconComponent className="h-16 w-16 text-primary/40" />
                                            </div>
                                        )}
                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                                        {/* Icon Badge (over image) */}
                                        <div className="absolute top-4 left-4 p-2 bg-background/60 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                                            <IconComponent className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex-1">
                                            {service.category && (
                                                <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-lg mb-3">
                                                    {service.category}
                                                </span>
                                            )}
                                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                {service.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                                {service.description}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-6 flex items-center gap-3">
                                            <Link
                                                href={`/services/${service.slug}`}
                                                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                            >
                                                Learn More
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                        detail: { itemType: 'service', itemTitle: service.title }
                                                    }))
                                                }}
                                                className="p-3 border border-border rounded-2xl hover:bg-secondary transition-colors"
                                                aria-label="Chat about this service"
                                            >
                                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center mt-20"
                >
                    <Link
                        href="/services"
                        className="group relative inline-flex items-center gap-4 px-10 py-5 bg-foreground text-background rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl"
                    >
                        <span>Explore All Expertise</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

