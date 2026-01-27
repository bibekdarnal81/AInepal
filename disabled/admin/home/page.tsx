'use client'

import Link from 'next/link'
import { Grid, FileText, ShoppingBag, Users, Settings, Calendar, Globe } from 'lucide-react'

export default function AdminHome() {
    const cards = [
        { title: 'Bundle Offers', icon: Grid, href: '/admin/bundle-offers', bg: 'bg-green-500/10 text-green-500' },
        { title: 'Posts', icon: FileText, href: '/admin/posts', bg: 'bg-indigo-500/10 text-indigo-500' },
        { title: 'Domains', icon: Globe, href: '/admin/domains', bg: 'bg-teal-500/10 text-teal-500' },
        { title: 'Hosting', icon: ShoppingBag, href: '/admin/hosting', bg: 'bg-purple-500/10 text-purple-500' },
        { title: 'Orders', icon: Calendar, href: '/admin/orders', bg: 'bg-amber-500/10 text-amber-500' },
        { title: 'Users', icon: Users, href: '/admin/users', bg: 'bg-pink-500/10 text-pink-500' },
        { title: 'Settings', icon: Settings, href: '/admin/settings', bg: 'bg-gray-500/10 text-gray-500' }
    ]

    return (
        <div className="p-8 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
            <h1 className="text-4xl font-bold text-foreground mb-8">Admin Panel – Home</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className={`flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors shadow-lg backdrop-blur-sm ${card.bg}`}
                    >
                        <card.icon className="h-8 w-8" />
                        <span className="text-xl font-medium">{card.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}