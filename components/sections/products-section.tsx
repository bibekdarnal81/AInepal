import Link from 'next/link';
import { Code, ShoppingCart, Smartphone, TrendingUp, Palette, Pencil } from 'lucide-react';

const products = [
    {
        id: 'web-dev',
        title: 'Web Development',
        description: 'Build stunning, responsive websites with modern technologies like React, Next.js, and Tailwind CSS.',
        icon: Code,
        href: '/web-development',
    },
    {
        id: 'ecommerce',
        title: 'E-Commerce Solutions',
        description: 'Complete e-commerce platforms with payment integration, inventory management, and admin dashboards.',
        icon: ShoppingCart,
        href: '/e-commerce',
    },
    {
        id: 'app-dev',
        title: 'App Development',
        description: 'Native and cross-platform mobile applications for iOS and Android using React Native and Flutter.',
        icon: Smartphone,
        href: '/app-development',
    },
    {
        id: 'marketing',
        title: 'Digital Marketing',
        description: 'Comprehensive digital marketing strategies including SEO, social media, and content marketing.',
        icon: TrendingUp,
        href: '/digital-marketing',
    },
    {
        id: 'uiux',
        title: 'UI/UX Design',
        description: 'User-centered design solutions that create beautiful, intuitive interfaces for your products.',
        icon: Palette,
        href: '/ui-ux-design',
    },
    {
        id: 'graphics',
        title: 'Graphics Design',
        description: 'Professional graphic design for branding, marketing materials, and digital assets.',
        icon: Pencil,
        href: '/graphics-design',
    },
];

export function ProductsSection() {
    return (
        <section className="bg-white py-16" id="products">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                        Products
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => {
                        const Icon = product.icon;
                        return (
                            <div
                                key={product.id}
                                className="group relative rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 p-8 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-blue-100 p-4 group-hover:bg-blue-500 transition-colors">
                                    <Icon className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
