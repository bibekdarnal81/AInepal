'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Globe, Plus, Edit, Trash2, Package } from 'lucide-react'
import Link from 'next/link'

interface HostingPlan {
    id: string
    name: string
    slug: string
    storage_gb: number
    bandwidth_text: string
    price: number
    features: string[]
    is_active: boolean
    created_at: string
}

export default function HostingPlansAdminPage() {
    const [plans, setPlans] = useState<HostingPlan[]>([])
    const [loading, setLoading] = useState(true)
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
            setPlans(data)
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

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Hosting Plans</h1>
                    <p className="text-muted-foreground">Manage web hosting plans and pricing</p>
                </div>
                <Link
                    href="/admin/hosting/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Plan
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hosting plans yet</p>
                    <Link
                        href="/admin/hosting/new"
                        className="inline-block mt-4 text-primary hover:underline"
                    >
                        Create your first hosting plan
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className="bg-card border border-border rounded-xl p-6 relative"
                        >
                            {!plan.is_active && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded-full">
                                        Inactive
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-foreground">
                                        रू {plan.price.toLocaleString('en-NP')}
                                    </span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="text-sm text-foreground">
                                    <span className="font-medium">Storage:</span> {plan.storage_gb} GB
                                </div>
                                <div className="text-sm text-foreground">
                                    <span className="font-medium">Bandwidth:</span> {plan.bandwidth_text}
                                </div>
                                {plan.features && plan.features.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        {plan.features.length} features included
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/admin/hosting/${plan.id}`}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${plan.is_active
                                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                            : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                        }`}
                                >
                                    {plan.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => deletePlan(plan.id)}
                                    className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
