'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Search, MoreVertical, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface HostingPlan {
    id: string
    name: string
    slug: string
    storage_gb: number
    bandwidth_text: string
    price: number
    price_yearly: number
    features: string[]
    type: 'shared' | 'vps' | 'dedicated'
    is_active: boolean
    created_at: string
}

export default function HostingPlansAdminPage() {
    const [plans, setPlans] = useState<HostingPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        const { data, error } = await supabase
            .from('hosting_plans')
            .select('*')
            .order('price', { ascending: true })

        if (!error && data) {
            setPlans(data as any)
        }
        setLoading(false)
    }

    const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('hosting_plans')
            .update({ is_active: !currentStatus })
            .eq('id', planId)

        if (!error) {
            fetchPlans()
        }
    }

    const deletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this hosting plan?')) return

        const { error } = await supabase
            .from('hosting_plans')
            .delete()
            .eq('id', planId)

        if (!error) {
            fetchPlans()
        }
    }

    const filteredPlans = plans.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'dedicated': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
            case 'vps': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
            default: return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
        }
    }

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Hosting Plans</h1>
                    <p className="text-muted-foreground">Manage and monitor your hosting packages</p>
                </div>
                <Link
                    href="/admin/hosting/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Plan
                </Link>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search plans..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-secondary/50 border-b border-border">
                                    <th className="text-left px-6 py-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Plan Details</th>
                                    <th className="text-left px-6 py-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Resources</th>
                                    <th className="text-left px-6 py-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Pricing</th>
                                    <th className="text-left px-6 py-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-right px-6 py-4 font-medium text-sm text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-foreground">{plan.name}</div>
                                                <div className="text-xs text-muted-foreground">{plan.slug}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${getTypeColor(plan.type)}`}>
                                                {plan.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="flex items-center gap-1.5 text-foreground">
                                                    <span className="text-muted-foreground">Storage:</span> {plan.storage_gb} GB
                                                </div>
                                                <div className="flex items-center gap-1.5 text-foreground">
                                                    <span className="text-muted-foreground">BW:</span> {plan.bandwidth_text}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-foreground">
                                                    रू {plan.price.toLocaleString()} <span className="text-muted-foreground font-normal text-xs">/mo</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    रू {plan.price_yearly?.toLocaleString()} <span className="font-normal text-[10px]">/yr</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors ${plan.is_active
                                                        ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20'
                                                        : 'text-muted-foreground bg-secondary hover:bg-secondary/80'
                                                    }`}
                                            >
                                                {plan.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {plan.is_active ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/hosting/${plan.id}`}
                                                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="Edit Plan"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => deletePlan(plan.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                                                    title="Delete Plan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredPlans.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            No plans found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
