'use client'
// Updated: Fixed profile join query syntax


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Filter, Eye } from 'lucide-react'

interface Order {
    id: string
    user_id: string
    item_type: string
    item_title: string
    amount: number
    currency: string
    status: string
    created_at: string
    profiles?: {
        display_name: string
        email?: string
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchOrders()
    }, [filterStatus])

    const fetchOrders = async () => {
        try {
            // First, try the standard query with profiles join
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    profiles!orders_user_id_fkey (
                        display_name
                    )
                `)
                .order('created_at', { ascending: false })

            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error fetching orders with profiles join:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })

                // Fallback: Fetch orders without profile join, then fetch profiles separately
                console.log('Attempting fallback query without profiles join...')
                let fallbackQuery = supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (filterStatus !== 'all') {
                    fallbackQuery = fallbackQuery.eq('status', filterStatus)
                }

                const { data: ordersData, error: ordersError } = await fallbackQuery

                if (ordersError) {
                    console.error('Error in fallback query:', ordersError)
                    setLoading(false)
                    return
                }

                // Fetch all unique user profiles
                if (ordersData && ordersData.length > 0) {
                    const userIds = [...new Set(ordersData.map(o => o.user_id))]
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, display_name')
                        .in('id', userIds)

                    // Map profiles to orders
                    const ordersWithProfiles = ordersData.map(order => ({
                        ...order,
                        profiles: profilesData?.find(p => p.id === order.user_id) || null
                    }))

                    setOrders(ordersWithProfiles)
                }
                setLoading(false)
                return
            }

            if (data) {
                setOrders(data)
            }
        } catch (err) {
            console.error('Unexpected error fetching orders:', err)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId)

        if (!error) {
            fetchOrders()
        }
    }

    const filteredOrders = orders.filter(order =>
        order.item_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
                <p className="text-muted-foreground mt-1">View and manage all customer orders</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by item or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-500">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-500">
                        {orders.filter(o => o.status === 'paid').length}
                    </p>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                        रू {orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0).toLocaleString('en-NP')}
                    </p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">No orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Item</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-secondary/30">
                                        <td className="px-6 py-4 text-foreground">
                                            {order.profiles?.display_name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-foreground">{order.item_title}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary font-medium capitalize">
                                                {order.item_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-foreground font-medium">
                                            {order.currency === 'NPR' ? 'रू ' : '$'}{order.amount.toLocaleString('en-NP')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className={`px-3 py-1 text-xs rounded-full font-medium border-0 cursor-pointer ${order.status === 'paid'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : order.status === 'pending'
                                                        ? 'bg-yellow-500/10 text-yellow-500'
                                                        : order.status === 'cancelled'
                                                            ? 'bg-red-500/10 text-red-500'
                                                            : 'bg-gray-500/10 text-gray-500'
                                                    }`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="cancelled">Cancelled</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground text-sm">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-secondary rounded-lg transition-colors" title="View details">
                                                <Eye className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
