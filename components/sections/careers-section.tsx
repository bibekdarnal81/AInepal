'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { BriefcaseBusiness, MapPin, ArrowRight } from 'lucide-react';

interface CareerItem {
    id: string;
    title: string;
    slug: string;
    location: string | null;
    employment_type: string | null;
    department: string | null;
}

export function CareersSection() {
    const [careers, setCareers] = useState<CareerItem[]>([]);


    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await fetch('/api/careers');
                if (response.ok) {
                    const data = await response.json();
                    setCareers(data);
                }
            } catch (error) {
                console.error('Error fetching careers:', error);
            }
        };

        fetchCareers();
    }, []);

    if (careers.length === 0) return null;

    return (
        <section className="relative py-24 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/60 text-sm text-muted mb-4">
                            <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
                            Careers
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-primary">
                            Join the team building AINepal
                        </h2>
                        <p className="text-muted mt-3 max-w-2xl">
                            Open roles across product, engineering, and growth. Build with a team that ships.
                        </p>
                    </div>
                    <Link
                        href="/careers"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:text-emerald-500 transition-colors"
                    >
                        View all roles
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {careers.map((role) => (
                        <Link
                            key={role.id}
                            href={`/careers/${role.slug}`}
                            className="group rounded-2xl border border-border/60 bg-card p-6 hover:border-emerald-500/40 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary group-hover:text-emerald-500 transition-colors">
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
                                    <span className="inline-flex items-center gap-1">
                                        {role.employment_type}
                                    </span>
                                )}
                            </div>
                            <div className="mt-6 text-sm text-emerald-500 font-medium">
                                View role →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
