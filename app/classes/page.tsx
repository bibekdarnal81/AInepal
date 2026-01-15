'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { GraduationCap, Calendar, Clock, ArrowRight } from 'lucide-react';

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
}

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchClasses = async () => {
            const { data } = await supabase
                .from('classes')
                .select('*')
                .eq('is_published', true)
                .order('display_order', { ascending: true });

            if (data) {
                setClasses(data as ClassItem[]);
            }
            setLoading(false);
        };

        fetchClasses();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-background text-primary">
            <Header />
            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/60 text-sm text-muted mb-6">
                            <GraduationCap className="h-4 w-4 text-emerald-500" />
                            Classes
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                            Classes designed to ship real products
                        </h1>
                        <p className="text-muted text-lg">
                            Learn with structured sessions, practical exercises, and project-ready outcomes.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                            <p className="text-muted">No classes available right now.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {classes.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/classes/${item.slug}`}
                                    className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:border-emerald-500/40 transition-colors"
                                >
                                    <div className="h-44 w-full bg-secondary/60 overflow-hidden">
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
                                            <span className="text-emerald-500 font-medium inline-flex items-center gap-1">
                                                View details <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
