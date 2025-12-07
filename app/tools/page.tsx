import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Palette, Code2, FileJson, Wand2, Layout, Cpu } from 'lucide-react';

const tools = [
    {
        id: 1,
        title: 'Color Palette Generator',
        description: 'Generate beautiful color palettes for your next project with AI-powered suggestions.',
        icon: Palette,
        status: 'Available',
    },
    {
        id: 2,
        title: 'Code Formatter',
        description: 'Format and beautify your code with support for multiple languages and frameworks.',
        icon: Code2,
        status: 'Available',
    },
    {
        id: 3,
        title: 'JSON Validator',
        description: 'Validate, format, and analyze JSON data with detailed error messages.',
        icon: FileJson,
        status: 'Available',
    },
    {
        id: 4,
        title: 'CSS Generator',
        description: 'Generate CSS code for gradients, shadows, animations, and more visually.',
        icon: Wand2,
        status: 'Coming Soon',
    },
    {
        id: 5,
        title: 'Component Library',
        description: 'Browse and copy ready-to-use React components for your projects.',
        icon: Layout,
        status: 'Available',
    },
    {
        id: 6,
        title: 'API Testing Tool',
        description: 'Test your REST APIs with an intuitive interface and save request collections.',
        icon: Cpu,
        status: 'Coming Soon',
    },
];

export default function ToolsPage() {
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
                            Developer Tools
                        </h1>
                        <p className="text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                            Free tools to boost your productivity and streamline your development workflow.
                        </p>
                    </div>
                </section>

                {/* Tools Grid */}
                <section className="bg-slate-950 py-16">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {tools.map((tool) => {
                                const Icon = tool.icon;
                                const isAvailable = tool.status === 'Available';

                                return (
                                    <div
                                        key={tool.id}
                                        className="group rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="inline-flex items-center justify-center rounded-lg bg-purple-500/10 p-3 group-hover:bg-purple-500/20 transition-colors">
                                                <Icon className="h-8 w-8 text-purple-400" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isAvailable
                                                    ? 'bg-green-500/20 text-green-300'
                                                    : 'bg-orange-500/20 text-orange-300'
                                                }`}>
                                                {tool.status}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                            {tool.title}
                                        </h3>

                                        <p className="text-gray-400 mb-6">
                                            {tool.description}
                                        </p>

                                        <Button
                                            variant={isAvailable ? "primary" : "ghost"}
                                            size="sm"
                                            className="w-full"
                                            disabled={!isAvailable}
                                        >
                                            {isAvailable ? 'Try Now' : 'Coming Soon'}
                                        </Button>
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
                            Need a Custom Tool?
                        </h2>
                        <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
                            We build custom development tools tailored to your specific needs. Get in touch to discuss your requirements.
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
