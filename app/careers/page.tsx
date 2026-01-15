'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BriefcaseBusiness, MapPin, ArrowRight } from 'lucide-react';

interface CareerItem {
    id: string;
    title: string;
    slug: string;
    location: string | null;
    employment_type: string | null;
    department: string | null;
    experience: string | null;
}

export default function CareersPage() {
    const [careers, setCareers] = useState<CareerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchCareers = async () => {
            const { data } = await supabase
                .from('careers')
                .select('*')
                .eq('is_published', true)
                .order('display_order', { ascending: true });

            if (data) {
                setCareers(data as CareerItem[]);
            }
            setLoading(false);
        };

        fetchCareers();
    }, [supabase]);

    return (
        <div className="min-h-screen bg-background text-primary">
            <Header />
            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/60 text-sm text-muted mb-6">
                            <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
                            Careers
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                            Build products with a team that ships
                        </h1>
                        <p className="text-muted text-lg">
                            Join Dunzo and help teams worldwide deliver reliable software faster.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : careers.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-2xl border border-border/60">
                            <p className="text-muted">No roles available right now.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {careers.map((role) => (
                                <Link
                                    key={role.id}
                                    href={`/careers/${role.slug}`}
                                    className="group rounded-2xl border border-border/60 bg-card p-6 hover:border-emerald-500/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-primary group-hover:text-emerald-500 transition-colors">
                                                {role.title}
                                            </h3>
                                            <p className="text-muted text-sm mt-2">
                                                {role.department || 'General'}
                                            </p>
                                        </div>
                                        <BriefcaseBusiness className="h-5 w-5 text-emerald-500/70" />
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {role.location || 'Remote'}
                                        </span>
                                        {role.employment_type && (
                                            <span>{role.employment_type}</span>
                                        )}
                                        {role.experience && (
                                            <span>{role.experience}</span>
                                        )}
                                    </div>
                                    <div className="mt-6 text-sm text-emerald-500 font-medium inline-flex items-center gap-2">
                                        View role <ArrowRight className="h-4 w-4" />
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
