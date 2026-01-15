import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BriefcaseBusiness, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CareerItem {
    id: string;
    title: string;
    slug: string;
    location: string | null;
    employment_type: string | null;
    department: string | null;
    experience: string | null;
    description: string | null;
    requirements: string | null;
    apply_url: string | null;
}

async function getCareer(slug: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('careers')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    return data as CareerItem | null;
}

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const role = await getCareer(slug);

    if (!role) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-background text-primary">
            <Header />
            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 space-y-10">
                    <Link href="/careers" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Careers
                    </Link>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/60 border border-border/60 text-sm text-muted">
                            <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
                            {role.department || 'Careers'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary">{role.title}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-muted">
                            <span className="inline-flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {role.location || 'Remote'}
                            </span>
                            {role.employment_type && <span>{role.employment_type}</span>}
                            {role.experience && <span>{role.experience}</span>}
                        </div>
                    </div>

                    {role.apply_url && (
                        <div>
                            <Link
                                href={role.apply_url}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Apply Now
                            </Link>
                        </div>
                    )}

                    {role.description && (
                        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-muted prose-strong:text-primary dark:prose-invert">
                            <div dangerouslySetInnerHTML={{ __html: role.description }} />
                        </div>
                    )}

                    {role.requirements && (
                        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-muted prose-strong:text-primary dark:prose-invert">
                            <h2>Requirements</h2>
                            <div dangerouslySetInnerHTML={{ __html: role.requirements }} />
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
