import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Code, ShoppingCart, Smartphone, TrendingUp, Palette, Pencil } from 'lucide-react';

const services = [
    {
        id: 1,
        title: 'E-Commerce Website',
        price: '$1,000',
        description: 'Complete online store solution built for modern businesses ready to sell online. Features secure payment processing, inventory management, and a powerful admin dashboard.',
        icon: ShoppingCart,
        features: ['Product Management', 'Secure Payment', 'Admin Dashboard', 'Responsive Design'],
    },
    {
        id: 2,
        title: 'Single Page Website',
        price: '$200',
        description: 'Perfect for businesses, personal brands, or landing pages that need to make a strong first impression with an elegant, scrollable format.',
        icon: Code,
        features: ['Modern Design', 'SEO Optimized', 'Contact Forms', 'Fast Loading'],
    },
    {
        id: 3,
        title: 'Blog Website',
        price: '$250',
        description: 'Modern blog platform with content management system designed for writers, businesses, and content creators with SEO optimization.',
        icon: Pencil,
        features: ['CMS Integration', 'SEO Ready', 'Social Sharing', 'Comment System'],
    },
    {
        id: 4,
        title: 'Portfolio Website',
        price: '$200',
        description: 'Showcase your work with a stunning portfolio website that highlights your skills and achievements with project galleries and case studies.',
        icon: Palette,
        features: ['Project Galleries', 'Case Studies', 'Contact Forms', 'Professional Design'],
    },
    {
        id: 5,
        title: 'Custom Web Development',
        price: '$1,500',
        description: 'Tailored web solutions for unique business requirements. Complex web applications, API integration, or specialized functionality built from the ground up.',
        icon: Code,
        features: ['Custom Solutions', 'API Integration', 'Scalable Architecture', 'Cloud Deployment'],
    },
    {
        id: 6,
        title: 'App Development',
        price: '$2,000',
        description: 'Native and cross-platform mobile applications for iOS and Android. Full-featured apps with modern UI and seamless performance.',
        icon: Smartphone,
        features: ['iOS & Android', 'Push Notifications', 'Offline Support', 'App Store Deployment'],
    },
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 py-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                                Transform Your Ideas Into Digital Reality
                            </h1>
                            <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto mb-8">
                                With over 5 years of experience in modern web development, I specialize in creating high-performance, user-friendly websites and applications using cutting-edge technologies like React, Next.js, and Node.js.
                            </p>
                            <Link href="/contact">
                                <Button variant="primary" size="lg">
                                    Free Consultation
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="bg-white py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Choose Your Perfect Solution
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Compare our comprehensive web development services to find the ideal match for your project requirements and budget.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {services.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <div
                                        key={service.id}
                                        className="group rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 p-8 transition-all duration-300 hover:shadow-xl"
                                    >
                                        <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-blue-100 p-4 group-hover:bg-blue-500 transition-colors">
                                            <Icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {service.title}
                                        </h3>

                                        <div className="text-3xl font-bold text-blue-600 mb-4">
                                            {service.price}
                                        </div>

                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {service.description}
                                        </p>

                                        <ul className="space-y-3 mb-6">
                                            {service.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <Link href="/contact">
                                            <Button variant="primary" size="md" className="w-full">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Let's Build Something Amazing Together
                        </h2>
                        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                            Have a project in mind? Get in touch and let's discuss how we can help you achieve your goals.
                        </p>
                        <Link href="/contact">
                            <Button variant="secondary" size="lg">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
