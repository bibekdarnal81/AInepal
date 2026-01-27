'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const projects = [
    {
        id: 1,
        name: 'Tulos Ecommerce Website',
        image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&h=600&fit=crop',
        purchaseLink: 'https://buymeacoffee.com/ AINepal',
    },
    {
        id: 2,
        name: 'Complete Cryptocurrency Analytics',
        image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&h=600&fit=crop',
        purchaseLink: 'https://buymeacoffee.com/ AINepal',
    },
    {
        id: 3,
        name: 'Orebi Shopping Platform',
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop',
        purchaseLink: 'https://buymeacoffee.com/ AINepal',
    },
    {
        id: 4,
        name: 'Shopcart Ecommerce App',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop',
        purchaseLink: 'https://buymeacoffee.com/ AINepal',
    },
    {
        id: 5,
        name: 'React Native Ecommerce',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
        purchaseLink: 'https://buymeacoffee.com/ AINepal',
    },
    {
        id: 6,
        name: 'Multi-AI Chat Platform',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
        purchaseLink: 'https://buymeacoffee.com/ AINepal',
    },
];

export function ProjectsSection() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="bg-gray-50 py-16" id="projects">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Get Your Dream Projects
                    </h2>
                    <Link href="/projects" className="text-blue-600 hover:text-blue-700 font-medium">
                        View all
                    </Link>
                </div>

                <div className="relative">
                    {/* Scroll buttons */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>

                    {/* Projects container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {projects.map((project, index) => {
                            const borderColors = [
                                'border-orange-500',
                                'border-gray-900',
                                'border-orange-500',
                                'border-orange-500',
                                'border-red-500',
                                'border-green-600'
                            ];
                            return (
                                <div
                                    key={project.id}
                                    className={`group flex-none w-80 rounded-xl overflow-hidden bg-white border-4 ${borderColors[index % borderColors.length]} hover:shadow-xl transition-all duration-300`}
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={project.image}
                                            alt={project.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, 320px"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                                            {project.name}
                                        </h3>
                                        <Link href={project.purchaseLink} target="_blank">
                                            <Button variant="primary" size="sm" className="w-full">
                                                Purchase Premium Code
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
