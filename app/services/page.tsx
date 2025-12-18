'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BuyButton } from '@/components/buy-button'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Check, MessageSquare } from 'lucide-react'

interface Service {
    id: string
    title: string
    slug: string
    description: string | null
    price: number
    currency: string
    icon_name: string | null
    thumbnail_url: string | null
    features: string[]
    is_featured: boolean
    is_published: boolean
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_published', true)
                .order('display_order', { ascending: true })

            if (!error && data) {
                setServices(data)
            }
            setLoading(false)
        }
        fetchServices()
    }, [supabase])

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 py-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                                Transform Your Ideas Into Digital Reality
                            </h1>
                            <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto mb-8">
                                With over 5 years of experience in modern web development, I specialize in creating high-performance, user-friendly websites and applications using cutting-edge technologies like React, Next.js, and Node.js.
                            </p>
                            <Link href="/contact">
                                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                    Free Consultation
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Choose Your Perfect Solution
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Compare our comprehensive web development services to find the ideal match for your project requirements and budget.
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No services available at the moment. Please check back later!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {services.map((service) => {
                                    const IconComponent = service.icon_name && (Icons as any)[service.icon_name]
                                        ? (Icons as any)[service.icon_name]
                                        : Icons.Code

                                    return (
                                        <div
                                            key={service.id}
                                            className="group rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 p-8 transition-all duration-300 hover:shadow-xl"
                                        >
                                            <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-blue-100 p-4 group-hover:bg-blue-500 transition-colors">
                                                <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                                            </div>

                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                {service.title}
                                            </h3>

                                            <div className="text-3xl font-bold text-blue-600 mb-4">
                                                {service.currency === 'USD' && '$'}
                                                {service.currency === 'EUR' && '€'}
                                                {service.currency === 'GBP' && '£'}
                                                {service.currency === 'NPR' && 'Rs '}
                                                {service.price.toLocaleString()}
                                            </div>

                                            {service.description && (
                                                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-4">
                                                    {service.description}
                                                </p>
                                            )}

                                            {service.features && service.features.length > 0 && (
                                                <ul className="space-y-3 mb-6">
                                                    {service.features.map((feature: string, index: number) => (
                                                        <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <BuyButton
                                                itemType="service"
                                                itemId={service.id}
                                                itemTitle={service.title}
                                                itemSlug={service.slug}
                                                amount={service.price}
                                                currency={service.currency}
                                                className="w-full py-3 text-center"
                                            >
                                                Get Started
                                            </BuyButton>

                                            <button
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                        detail: { itemType: 'service', itemTitle: service.title }
                                                    }))
                                                }}
                                                className="w-full mt-3 flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                                            >
                                                <MessageSquare className="h-5 w-5" />
                                                Ask About This Service
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Let's Build Something Amazing Together
                        </h2>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Have a project in mind? Get in touch and let's discuss how we can help you achieve your goals.
                        </p>
                        <Link href="/contact">
                            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                Contact Us
                            </button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}
