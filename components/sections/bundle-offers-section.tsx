'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';

interface BundleOffer {
    id: string;
    name: string;
    description: string;
    price: number;
    discount_percent: number;
    poster_url?: string;
    hosting_type: string;
}

export function BundleOffersSection() {
    const [offers, setOffers] = useState<BundleOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/api/bundles?showOnHome=true');
                if (!response.ok) {
                    throw new Error('Failed to fetch bundle offers');
                }
                const data = await response.json();
                setOffers(data);
            } catch (error) {
                console.error('Error fetching bundle offers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (!loading && offers.length === 0) return null;

    return (
        <section className="relative py-24 px-6 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mx-auto max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span>Special Offers</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                        Exclusive <span className="text-gradient">Bundles</span>
                    </h2>
                    <p className="text-lg text-muted max-w-2xl mx-auto">
                        Get the best value with our curated packages of services, projects, and hosting.
                    </p>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 rounded-2xl bg-muted/30 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer) => (
                            <div
                                key={offer.id}
                                className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
                            >
                                {/* Poster Image */}
                                <div className="relative h-48 w-full overflow-hidden bg-muted/40">
                                    {offer.poster_url ? (
                                        <Image
                                            src={offer.poster_url}
                                            alt={offer.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted bg-muted/60">
                                            <span className="text-4xl">🎁</span>
                                        </div>
                                    )}
                                    {/* Discount Badge */}
                                    {offer.discount_percent > 0 && (
                                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <Tag className="w-3 h-3" />
                                            {offer.discount_percent}% OFF
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-primary mb-1 group-hover:text-emerald-500 transition-colors">
                                                {offer.name}
                                            </h3>
                                            <p className="text-xs text-muted uppercase tracking-wider">
                                                {offer.hosting_type} Bundle
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description Preview */}
                                    <div
                                        className="text-muted text-sm mb-6 line-clamp-3 prose prose-sm prose-invert"
                                        dangerouslySetInnerHTML={{ __html: offer.description }}
                                    />

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted line-through">
                                                Rs. {Math.round(offer.price / (1 - offer.discount_percent / 100))}
                                            </span>
                                            <span className="text-2xl font-bold text-primary">
                                                Rs. {offer.price}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/bundles/${offer.id}`} // Assuming we'll make a detail page or just link to checkout
                                            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary hover:bg-emerald-500 text-primary hover:text-white transition-all duration-300 group-hover:scale-110"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
