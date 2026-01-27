'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface BundleOffer {
    id: string;
    name: string;
    price: number;
    discount_percent: number;
    show_on_home: boolean;
}

export function TopBanner() {
    const pathname = usePathname();
    const [offers, setOffers] = useState<BundleOffer[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/api/bundles?showOnHome=true');
                if (response.ok) {
                    const data = await response.json();
                    setOffers(data);
                }
            } catch (error) {
                console.error('Error fetching bundle offers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    // Slider Auto-rotation
    useEffect(() => {
        if (offers.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % offers.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [offers.length, isPaused]);

    // Sticky Height Communication
    useEffect(() => {
        const updateHeight = () => {
            const height = isVisible && bannerRef.current ? bannerRef.current.offsetHeight : 0;
            document.documentElement.style.setProperty('--banner-height', `${height}px`);
        };

        // Initial update
        updateHeight();

        // Observer for resize changes
        if (!bannerRef.current) return;

        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(bannerRef.current);

        return () => {
            resizeObserver.disconnect();
            document.documentElement.style.removeProperty('--banner-height');
        };
    }, [isVisible, offers]); // Re-run if visibility changes or offers load

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    };

    if (pathname?.startsWith('/admin')) return null;

    if (loading || offers.length === 0 || !isVisible) return null;

    const offer = offers[currentIndex];

    return (
        <div
            ref={bannerRef}
            className="sticky top-0 z-[60] bg-gradient-to-r from-emerald-900 via-emerald-900 to-emerald-900 text-white transition-all duration-300"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    {/* Navigation - Left */}
                    {offers.length > 1 && (
                        <button onClick={prevSlide} className="text-white/50 hover:text-white transition-colors">

                        </button>
                    )}

                    {/* Content */}
                    <div className="flex items-center gap-2 flex-1 justify-center text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500" key={offer.id}>
                        <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse hidden sm:block" />
                        <span className="hidden md:inline">Special Offer:</span>
                        <span className="font-bold text-yellow-400">{offer.name}</span>
                        <span className="hidden sm:inline">- Get it for only</span>
                        <span className="font-bold">Rs. {offer.price}</span>
                        {offer.discount_percent > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs hidden sm:inline-block">
                                {offer.discount_percent}% OFF
                            </span>
                        )}
                        <Link
                            href={`/bundles/${offer.id}`}
                            className="ml-2 underline hover:text-yellow-300 transition-colors whitespace-nowrap"
                        >
                            View Deal &rarr;
                        </Link>
                    </div>

                    {/* Navigation - Right & Close */}
                    <div className="flex items-center gap-2">
                        {offers.length > 1 && (
                            <button onClick={nextSlide} className="text-white/50 hover:text-white transition-colors mr-2">

                            </button>
                        )}
                        <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block"></div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
