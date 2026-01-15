'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Calendar, Clock, GraduationCap, ArrowRight } from 'lucide-react';

interface ClassItem {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    level: string | null;
    duration: string | null;
    start_date: string | null;
    price: number;
    currency: string;
    thumbnail_url: string | null;
    is_featured: boolean;
}

export function ClassesSection() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchClasses = async () => {
            const { data } = await supabase
                .from('classes')
                .select('*')
                .eq('is_published', true)
                .order('is_featured', { ascending: false })
                .order('display_order', { ascending: true })
                .limit(3);

            if (data) {
                setClasses(data as ClassItem[]);
            }
        };

        fetchClasses();
    }, [supabase]);

    if (classes.length === 0) return null;

    return (
        <section className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/60 text-sm text-muted mb-4">
                            <GraduationCap className="h-4 w-4 text-emerald-500" />
                            Classes
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">
                            Learn with hands-on classes
                        </h2>
                        <p className="text-muted mt-3 max-w-2xl">
                            Structured classes built by industry practitioners to help teams ship faster.
                        </p>
                    </div>
                    <Link
                        href="/classes"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:text-emerald-500 transition-colors"
                    >
                        View all classes
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((item) => (
                        <Link
                            key={item.id}
                            href={`/classes/${item.slug}`}
                            className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-emerald-500/40 transition-colors"
                        >
                            <div className="h-40 w-full bg-secondary/60 overflow-hidden">
                                {item.thumbnail_url ? (
                                    <img
                                        src={item.thumbnail_url}
                                        alt={item.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-muted">
                                        <GraduationCap className="h-8 w-8" />
                                    </div>
                                )}
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-primary group-hover:text-emerald-500 transition-colors">
                                        {item.title}
                                    </h3>
                                    {item.summary && (
                                        <p className="text-muted text-sm mt-2 line-clamp-2">
                                            {item.summary}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-muted">
                                    {item.start_date && (
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(item.start_date).toLocaleDateString()}
                                        </span>
                                    )}
                                    {item.duration && (
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {item.duration}
                                        </span>
                                    )}
                                    {item.level && (
                                        <span className="inline-flex items-center gap-1">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            {item.level}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-primary font-semibold">
                                        {item.currency === 'NPR' ? 'रू' : '$'} {item.price?.toLocaleString() || 0}
                                    </span>
                                    <span className="text-emerald-500 font-medium">Explore →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
