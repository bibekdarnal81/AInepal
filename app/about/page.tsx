import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Target, Users, Zap, Award } from 'lucide-react';

const values = [
    {
        id: 1,
        title: 'Our Mission',
        description: 'To empower developers and businesses with cutting-edge web technologies and comprehensive learning resources.',
        icon: Target,
    },
    {
        id: 2,
        title: 'Community First',
        description: 'Building a vibrant community of learners and professionals who support each other\'s growth.',
        icon: Users,
    },
    {
        id: 3,
        title: 'Innovation',
        description: 'Staying ahead of the curve with the latest technologies and best practices in web development.',
        icon: Zap,
    },
    {
        id: 4,
        title: 'Excellence',
        description: 'Delivering high-quality courses, projects, and services that exceed expectations.',
        icon: Award,
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                            About  Dunzo
                        </h1>
                        <p className="text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                            We're on a mission to make web development accessible to everyone through quality education and professional services.
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="bg-slate-950 py-16">
                    <div className="mx-auto max-w-4xl px-6 lg:px-8">
                        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 lg:p-12 border border-white/10">
                            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                                <p>
                                    Dunzo was founded with a simple vision: to bridge the gap between aspiring developers and the ever-evolving world of web technologies. We started as a small YouTube channel sharing React tutorials, and quickly grew into a comprehensive learning platform.
                                </p>
                                <p>
                                    Today, we serve thousands of students worldwide, offering everything from free tutorials to premium courses, from open-source projects to custom development services. Our team of experienced developers and instructors is passionate about sharing knowledge and building amazing products.
                                </p>
                                <p>
                                    We believe that quality education should be accessible to everyone, which is why we maintain a balance between free resources and premium offerings. Whether you're just starting your coding journey or looking to level up your skills,  Dunzo is here to support you every step of the way.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Grid */}
                <section className="bg-slate-900 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {values.map((value) => {
                                const Icon = value.icon;
                                return (
                                    <div
                                        key={value.id}
                                        className="text-center p-6 rounded-xl bg-slate-800/50 border border-white/5 hover:border-purple-500/30 transition-all"
                                    >
                                        <div className="inline-flex items-center justify-center rounded-full bg-purple-500/10 p-4 mb-4">
                                            <Icon className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-3">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            {value.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-purple-900 to-blue-900 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Join Our Community
                        </h2>
                        <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
                            Become part of a growing community of developers learning and building together.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/contact">
                                <Button variant="secondary" size="lg">
                                    Contact Us
                                </Button>
                            </Link>
                            <Link href="/services">
                                <Button variant="ghost" size="lg">
                                    Our Services
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
