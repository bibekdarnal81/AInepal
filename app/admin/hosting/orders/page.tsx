'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, User, Calendar, DollarSign } from 'lucide-react'

interface HostingOrder {
    id: string
    user_id: string
    plan_id: string
    domain: string | null
    status: string
    price: number
    billing_cycle: string
    next_billing_date: string | null
    created_at: string
    profiles: {
        full_name: string
        email: string
    }
    hosting_plans: {
        name: string
        slug: string
    }
}

export default function HostingOrdersAdminPage() {
    const [orders, setOrders] = useState<HostingOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const supabase = createClient()

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        let query = supabase
            .from('hosting_orders')
            .select(`
                *,
                profiles (email),
                hosting_plans (name, slug)
            `)
            .order('created_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query

        if (!error && data) {
            setOrders(data as any)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [filter])

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('hosting_orders')
            .update({ status: newStatus })
            .eq('id', orderId)

        if (!error) {
            fetchOrders()
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-500'
            case 'pending': return 'bg-yellow-500/10 text-yellow-500'
            case 'suspended': return 'bg-red-500/10 text-red-500'
            case 'cancelled': return 'bg-gray-500/10 text-gray-500'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Hosting Orders</h1>
                <p className="text-muted-foreground">Manage customer hosting subscriptions</p>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'active', 'suspended', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hosting orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-card border border-border rounded-xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {order.hosting_plans?.name || 'Unknown Plan'}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {order.domain && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Domain: {order.domain}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-foreground">
                                        रू {order.price.toLocaleString('en-NP')}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        /{order.billing_cycle}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">{order.profiles?.email || 'Unknown User'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Created: {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {['pending', 'active', 'suspended', 'cancelled'].map((status) => (
                                    order.status !== status && (
                                        <button
                                            key={status}
                                            onClick={() => updateOrderStatus(order.id, status)}
                                            className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                                        >
                                            Mark as {status}
                                        </button>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
