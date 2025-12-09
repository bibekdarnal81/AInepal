import Link from 'next/link';
import { Zap, Shield, Database, GitBranch, Globe, Clock, TrendingUp } from 'lucide-react';

const features = [
    {
        id: 'instant-deploy',
        title: 'Instant Deployments',
        description: 'Push to GitHub and watch your application go live in seconds. No configuration needed.',
        icon: Zap,
        href: '#instant-deploy',
    },
    {
        id: 'auto-scaling',
        title: 'Auto Scaling',
        description: 'Your infrastructure scales automatically with traffic. Pay only for what you use.',
        icon: TrendingUp,
        href: '#auto-scaling',
    },
    {
        id: 'database',
        title: 'Database Integration',
        description: 'One-click database provisioning with PostgreSQL, MySQL, MongoDB, and Redis.',
        icon: Database,
        href: '#database',
    },
    {
        id: 'github',
        title: 'GitHub Integration',
        description: 'Seamless integration with your GitHub repositories. Deploy on every push.',
        icon: GitBranch,
        href: '#github',
    },
    {
        id: 'global-cdn',
        title: 'Global CDN',
        description: 'Lightning-fast content delivery with our worldwide CDN network.',
        icon: Globe,
        href: '#global-cdn',
    },
    {
        id: 'uptime',
        title: '99.9% Uptime',
        description: 'Enterprise-grade reliability with automatic failover and health checks.',
        icon: Shield,
        href: '#uptime',
    },
];

export function ProductsSection() {
    return (
        <section className="relative py-24 px-6" id="products">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                        Everything you need to{' '}
                        <span className="text-gradient">ship faster</span>
                    </h2>
                    <p className="text-xl text-gray-400">
                        Deploy your apps with confidence. Rusha handles the infrastructure so you can focus on code.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.id}
                                className="group relative glass glass-hover rounded-xl p-8 cursor-pointer"
                            >
                                <div className="mb-6 inline-flex items-center justify-center rounded-lg bg-purple-500/10 p-4 group-hover:bg-purple-500/20 transition-all">
                                    <Icon className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Gradient border on hover */}
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
