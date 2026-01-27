import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Calendar, Clock, GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/mongodb/client';
import { Class } from '@/lib/mongodb/models';

interface ClassItem {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    description: string | null;
    level: string | null;
    duration: string | null;
    start_date: string | null;
    price: number;
    currency: string;
    thumbnail_url: string | null;
}

async function getClass(slug: string) {
    await dbConnect();
    const classItem = await Class.findOne({ slug, isActive: true }).lean();

    if (!classItem) return null;

    return {
        id: classItem._id.toString(),
        title: classItem.title,
        slug: classItem.slug,
        summary: classItem.summary || null,
        description: classItem.description || null,
        level: classItem.level || null,
        duration: classItem.duration || null,
        start_date: classItem.startDate ? classItem.startDate.toISOString() : null,
        price: classItem.price,
        currency: classItem.currency,
        thumbnail_url: classItem.thumbnailUrl || null,
    } as ClassItem;
}
export default async function ClassDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const classItem = await getClass(slug);

    if (!classItem) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-background text-primary">
            <Header />
            <main className="pt-28 pb-20">
                <div className="mx-auto max-w-6xl px-6 lg:px-8 space-y-12">
                    <Link href="/classes" className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Classes
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-bold text-primary">{classItem.title}</h1>
                            {classItem.summary && (
                                <p className="text-lg text-muted">{classItem.summary}</p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-muted">
                                {classItem.start_date && (
                                    <span className="inline-flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(classItem.start_date).toLocaleDateString()}
                                    </span>
                                )}
                                {classItem.duration && (
                                    <span className="inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        {classItem.duration}
                                    </span>
                                )}
                                {classItem.level && (
                                    <span className="inline-flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        {classItem.level}
                                    </span>
                                )}
                            </div>

                            <div className="text-3xl font-semibold text-primary">
                                {classItem.currency === 'NPR' ? 'रू' : '$'} {classItem.price?.toLocaleString() || 0}
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href={`/checkout/classes/${classItem.slug}`}
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                                >
                                    Enroll Now
                                </Link>
                                <Link
                                    href="/classes"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border/70 text-primary hover:border-emerald-500/60 hover:text-emerald-500 transition-colors"
                                >
                                    View All Classes
                                </Link>
                            </div>
                        </div>

                        <div className="relative rounded-3xl border border-border/60 bg-card overflow-hidden">
                            {classItem.thumbnail_url ? (
                                <div className="aspect-video relative">
                                    <Image
                                        src={classItem.thumbnail_url}
                                        alt={classItem.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-muted">
                                    <GraduationCap className="h-10 w-10" />
                                </div>
                            )}
                        </div>
                    </div>

                    {classItem.description && (
                        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-p:text-muted prose-strong:text-primary dark:prose-invert">
                            <div dangerouslySetInnerHTML={{ __html: classItem.description }} />
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
