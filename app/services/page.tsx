import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BuyButton } from '@/components/buy-button';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Check, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import dbConnect from '@/lib/mongodb/client';
import { Service } from '@/lib/mongodb/models';

interface ServiceData {
    _id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number;
    currency: string;
    iconName: string | null;
    thumbnailUrl: string | null;
    features: string[];
    isFeatured: boolean;
    isPublished: boolean;
}

async function getServices(): Promise<ServiceData[]> {
    await dbConnect();
    const services = await Service.find({ isPublished: true })
        .sort({ displayOrder: 1 })
        .lean();

    const typedServices = services as ServiceData[]
    return typedServices.map((s) => ({
        _id: s._id.toString(),
        title: s.title,
        slug: s.slug,
        description: s.description || null,
        price: s.price || 0,
        currency: s.currency || 'NPR',
        iconName: s.iconName || null,
        thumbnailUrl: s.thumbnailUrl || null,
        features: s.features || [],
        isFeatured: s.isFeatured || false,
        isPublished: s.isPublished || false,
    }));
}

export default async function ServicesPage() {
    const services = await getServices();

    return (
        <div className="min-h-screen bg-background text-primary selection:bg-primary/20 font-sans">
            <Header />

            <main className="relative pt-24 pb-20">
                {/* Background Gradients */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                {/* Hero Section */}
                <section className="relative z-10 px-6 lg:px-8 mb-20 lg:mb-32">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                            <Sparkles className="h-4 w-4" />
                            <span>Expert Web Solutions</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
                            Transform Your Ideas Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient">Digital Reality</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                            We specialize in high-performance web development, creating stunning user experiences with cutting-edge technologies.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="relative z-10 px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {services.length === 0 ? (
                            <div className="text-center py-20 px-6 bg-card rounded-3xl border border-border/60">
                                <p className="text-muted text-xl font-light">No services available right now.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {services.map((service) => {
                                    // Dynamically resolve icon
                                    const iconName = service.iconName as keyof typeof Icons | undefined
                                    const IconComponent = iconName && iconName in Icons
                                        ? Icons[iconName]
                                        : Icons.Code;

                                    return (
                                        <div
                                            key={service._id}
                                            className="group relative flex flex-col p-8 rounded-3xl bg-card backdrop-blur-sm border border-border/60 hover:border-blue-500/30 transition-all duration-300 hover:bg-card/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10"
                                        >
                                            {/* Header */}
                                            <div className="mb-6">
                                                <Link href={`/services/${service.slug}`} className="block group-hover:opacity-80 transition-opacity">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-border/60 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                                        <IconComponent className="h-7 w-7 text-blue-400 group-hover:text-blue-300" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-primary mb-2 group-hover:text-blue-500 transition-colors">
                                                        {service.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-muted line-clamp-3 text-sm leading-relaxed">
                                                    {service.description}
                                                </p>
                                            </div>

                                            {/* Features */}
                                            {service.features && service.features.length > 0 && (
                                                <ul className="mb-8 space-y-3 flex-grow">
                                                    {service.features.slice(0, 4).map((feature: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-secondary">
                                                            <div className="mt-1 w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                                <Check className="h-2.5 w-2.5 text-green-400" />
                                                            </div>
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                    {service.features.length > 4 && (
                                                        <li className="text-xs text-muted pl-7 flex items-center gap-1">
                                                            And {service.features.length - 4} more features...
                                                        </li>
                                                    )}
                                                </ul>
                                            )}

                                            {/* Pricing & Footer */}
                                            <div className="mt-auto pt-6 border-t border-border/60">
                                                <div className="flex items-end gap-1 mb-6">
                                                    <span className="text-3xl font-bold text-primary">
                                                        {service.currency === 'USD' && '$'}
                                                        {service.currency === 'EUR' && '€'}
                                                        {service.currency === 'GBP' && '£'}
                                                        {service.currency === 'NPR' && 'रू '}
                                                        {service.price.toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-muted mb-1.5 ml-1">/ project</span>
                                                </div>

                                                <div className="space-y-3">
                                                    <BuyButton
                                                        itemType="service"
                                                        itemId={service._id}
                                                        itemTitle={service.title}
                                                        itemSlug={service.slug}
                                                        amount={service.price}
                                                        currency={service.currency}
                                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30"
                                                    >
                                                        Get Started
                                                    </BuyButton>

                                                    <Link
                                                        href={`/services/${service.slug}`}
                                                        className="w-full py-3.5 rounded-xl border border-border/60 hover:border-border hover:bg-secondary/60 text-secondary hover:text-primary font-medium transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        Learn More
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="mt-20 lg:mt-32 px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-blue-50/80 to-card border border-border/60 px-6 py-16 sm:px-16 lg:py-24 text-center">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

                            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-6 relative z-10">
                                Not sure which service is right for you?
                            </h2>
                            <p className="max-w-xl mx-auto text-muted mb-10 text-lg relative z-10">
                                Schedule a free consultation call. We&apos;ll analyze your needs and recommend the perfect solution for your business.
                            </p>

                            <div className="relative z-10">
                                <Link href="/book-demo" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors">
                                    Book a Free Consultation
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
