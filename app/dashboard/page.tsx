'use client';

import { motion } from 'framer-motion';
import { Plus, Settings, GitBranch, Globe, Database, Server, Activity, Clock, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

// Project Card Component
const ProjectCard = ({ name, services, lastDeployed, status }: {
    name: string;
    services: number;
    lastDeployed: string;
    status: 'active' | 'building' | 'sleeping'
}) => (
    <motion.div
        className="bg-zinc-900/80 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer group"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-white font-semibold group-hover:text-violet-300 transition-colors">{name}</h3>
                    <p className="text-gray-500 text-sm">{services} services</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-400' :
                        status === 'building' ? 'bg-yellow-400 animate-pulse' :
                            'bg-gray-500'
                    }`} />
                <button className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastDeployed}
            </span>
            <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                main
            </span>
        </div>
    </motion.div>
);

// Service Item Component
const ServiceItem = ({ name, icon: Icon, url, status }: {
    name: string;
    icon: typeof Database;
    url?: string;
    status: 'running' | 'deploying' | 'stopped'
}) => (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded flex items-center justify-center ${status === 'running' ? 'bg-green-500/20' :
                    status === 'deploying' ? 'bg-yellow-500/20' :
                        'bg-gray-500/20'
                }`}>
                <Icon className={`w-4 h-4 ${status === 'running' ? 'text-green-400' :
                        status === 'deploying' ? 'text-yellow-400' :
                            'text-gray-400'
                    }`} />
            </div>
            <div>
                <p className="text-white text-sm font-medium">{name}</p>
                {url && <p className="text-violet-400 text-xs">{url}</p>}
            </div>
        </div>
        <span className={`text-xs capitalize ${status === 'running' ? 'text-green-400' :
                status === 'deploying' ? 'text-yellow-400' :
                    'text-gray-400'
            }`}>
            {status}
        </span>
    </div>
);

// Activity Item Component
const ActivityItem = ({ message, time, type }: {
    message: string;
    time: string;
    type: 'deploy' | 'build' | 'error' | 'info'
}) => (
    <div className="flex items-start gap-3 py-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${type === 'deploy' ? 'bg-green-400' :
                type === 'build' ? 'bg-blue-400' :
                    type === 'error' ? 'bg-red-400' :
                        'bg-gray-400'
            }`} />
        <div className="flex-1 min-w-0">
            <p className="text-gray-300 text-sm">{message}</p>
            <p className="text-gray-600 text-xs">{time}</p>
        </div>
    </div>
);

export default function DashboardPage() {
    const projects = [
        { name: 'gravy-truck', services: 5, lastDeployed: '2 min ago', status: 'active' as const },
        { name: 'portfolio-site', services: 2, lastDeployed: '1 hour ago', status: 'active' as const },
        { name: 'api-backend', services: 4, lastDeployed: '5 min ago', status: 'building' as const },
        { name: 'analytics-dashboard', services: 3, lastDeployed: '2 days ago', status: 'sleeping' as const },
    ];

    const services = [
        { name: 'frontend', icon: Globe, url: 'frontend-prod.up.rusha.app', status: 'running' as const },
        { name: 'api', icon: Server, url: 'api-prod.up.rusha.app', status: 'running' as const },
        { name: 'postgres', icon: Database, status: 'running' as const },
        { name: 'worker', icon: Activity, status: 'deploying' as const },
    ];

    const activities = [
        { message: 'Deployed frontend to production', time: '2 min ago', type: 'deploy' as const },
        { message: 'Build completed for api', time: '5 min ago', type: 'build' as const },
        { message: 'Worker service restarted', time: '10 min ago', type: 'info' as const },
        { message: 'Database backup completed', time: '1 hour ago', type: 'info' as const },
        { message: 'Deployed api to staging', time: '2 hours ago', type: 'deploy' as const },
    ];

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="border-b border-white/10 bg-black/80 backdrop-blur-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-white">
                            Rusha
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">Settings</Link>
                            <Link href="#" className="text-gray-400 hover:text-white transition-colors">Team</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                        <p className="text-gray-400">Manage your projects and deployments</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium">
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Projects Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-white font-semibold mb-4">Your Projects</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {projects.map((project, i) => (
                                <motion.div
                                    key={project.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <ProjectCard {...project} />
                                </motion.div>
                            ))}
                        </div>

                        {/* Current Project Services */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-white font-semibold">gravy-truck services</h2>
                                <Link href="#" className="text-violet-400 text-sm hover:text-violet-300 flex items-center gap-1">
                                    View all <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
                                {services.map((service, i) => (
                                    <ServiceItem key={i} {...service} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
                            <h3 className="text-white font-semibold mb-4">This Month</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Deployments</p>
                                    <p className="text-2xl font-bold text-white">127</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Build Minutes</p>
                                    <p className="text-2xl font-bold text-white">342</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Uptime</p>
                                    <p className="text-2xl font-bold text-green-400">99.9%</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-5">
                            <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
                            <div className="space-y-1">
                                {activities.map((activity, i) => (
                                    <ActivityItem key={i} {...activity} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
