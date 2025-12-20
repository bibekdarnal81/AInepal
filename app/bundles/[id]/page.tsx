import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CheckCircle2, Globe, Server, Briefcase, Box, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BuyBundleButton } from '@/components/buy-bundle-button';

interface Item {
    id: string;
    description: string;
    projects?: { title: string; image_url: string; description: string };
    services?: { title: string; icon: string; description: string };
    hosting_plans?: { name: string; storage_gb: number; bandwidth_text: string };
    domains?: { domain_name: string; tld: string };
}

export default async function BundlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch Bundle Info
    const { data: bundle, error: bundleError } = await supabase
        .from('bundle_offers')
        .select('*')
        .eq('id', id)
        .single();

    if (bundleError || !bundle) {
        notFound();
    }

    // Fetch Bundle Items
    // We use a broader select to get related data. 
    // Note: This assumes foreign key relationships are correctly detected by PostgREST
    const { data: items, error: itemsError } = await supabase
        .from('bundle_items')
        .select(`
            *,
            projects ( title, image_url, description ),
            services ( title, icon, description ),
            hosting_plans ( name, storage_gb, bandwidth_text ),
            domains ( domain_name, tld )
        `)
        .eq('bundle_id', id);

    const discountedPrice = bundle.discount_percent
        ? Math.round(bundle.price / (1 - bundle.discount_percent / 100))
        : bundle.price;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-6 max-w-6xl">
                    <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>

                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Left Column: Poster & Summary */}
                        <div className="space-y-8">
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-secondary border border-border shadow-2xl">
                                {bundle.poster_url ? (
                                    <img
                                        src={bundle.poster_url}
                                        alt={bundle.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                        <Box className="h-20 w-20 text-muted-foreground opacity-20" />
                                    </div>
                                )}
                                {bundle.discount_percent > 0 && (
                                    <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        {bundle.discount_percent}% OFF
                                    </div>
                                )}
                            </div>

                            <div className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                                <h1 className="text-3xl font-bold mb-4 gradient-text">{bundle.name}</h1>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-4xl font-bold">Rs. {bundle.price}</span>
                                    {bundle.discount_percent > 0 && (
                                        <span className="text-xl text-muted-foreground line-through mb-1">
                                            Rs. {discountedPrice}
                                        </span>
                                    )}
                                </div>
                                <BuyBundleButton bundleId={bundle.id} price={bundle.price} />
                                <p className="text-center text-xs text-muted-foreground mt-4">
                                    Instant delivery for hosting & standard services.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Details & Items */}
                        <div className="space-y-10">
                            <div className="prose prose-lg dark:prose-invert">
                                <h3>About this Bundle</h3>
                                <div dangerouslySetInnerHTML={{ __html: bundle.description }} />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    What's Included
                                </h3>
                                <div className="grid gap-4">
                                    {items?.map((item: Item) => {
                                        // Determine item type and data
                                        let type = 'Unknown';
                                        let title = '';
                                        let details = '';
                                        let icon = <Box className="h-6 w-6" />;

                                        if (item.projects) {
                                            type = 'Project';
                                            title = item.projects.title;
                                            details = item.projects.description;
                                            icon = <Briefcase className="h-6 w-6 text-blue-500" />;
                                        } else if (item.services) {
                                            type = 'Service';
                                            title = item.services.title;
                                            details = item.services.description;
                                            icon = <Server className="h-6 w-6 text-purple-500" />;
                                        } else if (item.hosting_plans) {
                                            type = 'Hosting';
                                            title = `${item.hosting_plans.name} Plan`;
                                            details = `${item.hosting_plans.storage_gb}GB Storage, ${item.hosting_plans.bandwidth_text} Bandwidth`;
                                            icon = <Globe className="h-6 w-6 text-cyan-500" />;
                                        } else if (item.domains) {
                                            type = 'Domain';
                                            title = `${item.domains.domain_name}.${item.domains.tld}`;
                                            details = 'Domain Registration';
                                            icon = <Globe className="h-6 w-6 text-orange-500" />;
                                        }

                                        return (
                                            <div key={item.id} className="group flex items-start p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                                                <div className="mr-4 p-3 rounded-lg bg-background shadow-sm group-hover:scale-105 transition-transform">
                                                    {icon}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                                                            {type}
                                                        </span>
                                                        <h4 className="font-semibold text-foreground">{title}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                        {details}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
