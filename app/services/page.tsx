'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyButton } from '@/components/buy-button';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Check, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Service {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    currency: string;
    icon_name: string | null;
    thumbnail_url: string | null;
    features: string[];
    is_featured: boolean;
    is_published: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_published', true)
                .order('display_order', { ascending: true });

            if (!error && data) {
                setServices(data);
            }
            setLoading(false);
        };
        fetchServices();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans">
            <Header />

            <main className="relative pt-24 pb-20">
                {/* Background Gradients */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                {/* Hero Section */}
                <section className="relative z-10 px-6 lg:px-8 mb-20 lg:mb-32">
                    <div className="mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                                <Sparkles className="h-4 w-4" />
                                <span>Expert Web Solutions</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                                Transform Your Ideas Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">Digital Reality</span>
                            </h1>

                            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                                We specialize in high-performance web development, creating stunning user experiences with cutting-edge technologies.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="relative z-10 px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                                    <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin-reverse"></div>
                                </div>
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-20 px-6 bg-zinc-900/50 rounded-3xl border border-white/5">
                                <p className="text-zinc-400 text-xl font-light">No services available right now.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {services.map((service, index) => {
                                    // Dynamically resolve icon
                                    const IconComponent = service.icon_name && (Icons as any)[service.icon_name]
                                        ? (Icons as any)[service.icon_name]
                                        : Icons.Code;

                                    return (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative flex flex-col p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:bg-zinc-900/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                                        >
                                            {/* Header */}
                                            <div className="mb-6">
                                                <Link href={`/services/${service.slug}`} className="block group-hover:opacity-80 transition-opacity">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                                        <IconComponent className="h-7 w-7 text-blue-400 group-hover:text-blue-300" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                        {service.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-zinc-400 line-clamp-3 text-sm leading-relaxed">
                                                    {service.description}
                                                </p>
                                            </div>

                                            {/* Features */}
                                            {service.features && service.features.length > 0 && (
                                                <ul className="mb-8 space-y-3 flex-grow">
                                                    {service.features.slice(0, 4).map((feature: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300/80">
                                                            <div className="mt-1 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                                <Check className="h-2.5 w-2.5 text-green-400" />
                                                            </div>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                    {service.features.length > 4 && (
                                                        <li className="text-xs text-zinc-500 pl-7 flex items-center gap-1">
                                                            And {service.features.length - 4} more features...
                                                        </li>
                                                    )}
                                                </ul>
                                            )}

                                            {/* Pricing & Footer */}
                                            <div className="mt-auto pt-6 border-t border-white/5">
                                                <div className="flex items-end gap-1 mb-6">
                                                    <span className="text-3xl font-bold text-white">
                                                        {service.currency === 'USD' && '$'}
                                                        {service.currency === 'EUR' && '€'}
                                                        {service.currency === 'GBP' && '£'}
                                                        {service.currency === 'NPR' && 'रू '}
                                                        {service.price.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-zinc-500 mb-1.5 ml-1">/ project</span>
                                                </div>

                                                <div className="space-y-3">
                                                    <BuyButton
                                                        itemType="service"
                                                        itemId={service.id}
                                                        itemTitle={service.title}
                                                        itemSlug={service.slug}
                                                        amount={service.price}
                                                        currency={service.currency}
                                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30"
                                                    >
                                                        Get Started
                                                    </BuyButton>

                                                    <button
                                                        onClick={() => {
                                                            window.dispatchEvent(new CustomEvent('openChatWithMessage', {
                                                                detail: { itemType: 'service', itemTitle: service.title }
                                                            }));
                                                        }}
                                                        className="w-full py-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-300 hover:text-white font-medium transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        Ask a Question
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="mt-20 lg:mt-32 px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-900/20 to-black border border-white/10 px-6 py-16 sm:px-16 lg:py-24 text-center">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 relative z-10">
                                Not sure which service is right for you?
                            </h2>
                            <p className="max-w-xl mx-auto text-zinc-400 mb-10 text-lg relative z-10">
                                Schedule a free consultation call. We'll analyze your needs and recommend the perfect solution for your business.
                            </p>

                            <div className="relative z-10">
                                <Link href="/book-demo" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-zinc-200 transition-colors">
                                    Book a Free Consultation
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
