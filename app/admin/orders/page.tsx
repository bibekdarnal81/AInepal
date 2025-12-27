'use client'
// Updated: Fixed profile join query syntax


import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search, Filter, Eye, X } from 'lucide-react'

interface Order {
    id: string
    user_id: string
    item_type: string
    item_title: string
    amount: number
    currency: string
    status: string
    created_at: string
    payment_proof_url?: string | null
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchOrders()
    }, [filterStatus])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            // 1. Fetch all orders (without joining profiles to avoid DB errors)
            const results = await Promise.allSettled([
                supabase.from('hosting_orders').select('*, hosting_plans(name)').order('created_at', { ascending: false }),
                supabase.from('service_orders').select('*, services(title)').order('created_at', { ascending: false }),
                supabase.from('project_orders').select('*, projects(title)').order('created_at', { ascending: false }),
                supabase.from('domain_orders').select('*').order('created_at', { ascending: false }),
                supabase.from('bundle_orders').select('*, bundle_offers(name)').order('created_at', { ascending: false })
            ])

            const hosting = results[0].status === 'fulfilled' && !results[0].value.error ? results[0].value.data : []
            const services = results[1].status === 'fulfilled' && !results[1].value.error ? results[1].value.data : []
            const projects = results[2].status === 'fulfilled' && !results[2].value.error ? results[2].value.data : []
            const domains = results[3].status === 'fulfilled' && !results[3].value.error ? results[3].value.data : []
            const bundles = results[4].status === 'fulfilled' && !results[4].value.error ? results[4].value.data : []

            // 2. Collect all User IDs
            const allUserIds = new Set<string>([
                ...(hosting?.map((o: any) => o.user_id) || []),
                ...(services?.map((o: any) => o.user_id) || []),
                ...(projects?.map((o: any) => o.user_id) || []),
                ...(domains?.map((o: any) => o.user_id) || []),
                ...(bundles?.map((o: any) => o.user_id) || [])
            ])

            // 3. Fetch Profiles separately
            let profilesMap: Record<string, any> = {}
            if (allUserIds.size > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, display_name, email')
                    .in('id', Array.from(allUserIds))

                if (profiles) {
                    profilesMap = profiles.reduce((acc, profile) => {
                        acc[profile.id] = profile
                        return acc
                    }, {} as Record<string, any>)
                }
            }

            // 4. Combine Data
            const allOrders: Order[] = [
                ...(hosting?.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    item_type: 'hosting',
                    item_title: o.hosting_plans?.name || 'Hosting Plan',
                    amount: o.amount || o.price || 0,
                    currency: 'NPR',
                    status: o.status,
                    created_at: o.created_at,
                    payment_proof_url: o.payment_proof_url,
                    profiles: profilesMap[o.user_id]
                })) || []),
                ...(services?.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    item_type: 'service',
                    item_title: o.services?.title || 'Service',
                    amount: o.amount,
                    currency: 'NPR',
                    status: o.status,
                    created_at: o.created_at,
                    payment_proof_url: o.payment_proof_url,
                    profiles: profilesMap[o.user_id]
                })) || []),
                ...(projects?.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    item_type: 'project',
                    item_title: o.projects?.title || 'Project',
                    amount: o.amount,
                    currency: 'NPR',
                    status: o.status,
                    created_at: o.created_at,
                    payment_proof_url: o.payment_proof_url,
                    profiles: profilesMap[o.user_id]
                })) || []),
                ...(domains?.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    item_type: 'domain',
                    item_title: o.domain_name,
                    amount: o.amount,
                    currency: 'NPR',
                    status: o.status,
                    created_at: o.created_at,
                    payment_proof_url: o.payment_proof_url,
                    profiles: profilesMap[o.user_id]
                })) || []),
                ...(bundles?.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    item_type: 'bundle',
                    item_title: o.bundle_offers?.name || 'Bundle Offer',
                    amount: o.amount,
                    currency: 'NPR',
                    status: o.status,
                    created_at: o.created_at,
                    payment_proof_url: o.payment_proof_url,
                    profiles: profilesMap[o.user_id]
                })) || [])
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            if (filterStatus !== 'all') {
                setOrders(allOrders.filter(o => o.status === filterStatus))
            } else {
                setOrders(allOrders)
            }

        } catch (err) {
            console.error('Error fetching orders:', err)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, newStatus: string, itemType: string) => {
        let table = ''
        switch (itemType) {
            case 'hosting': table = 'hosting_orders'; break;
            case 'service': table = 'service_orders'; break;
            case 'project': table = 'project_orders'; break;
            case 'domain': table = 'domain_orders'; break;
            case 'bundle': table = 'bundle_orders'; break;
            default: return;
        }

        const { error } = await supabase
            .from(table)
            .update({ status: newStatus })
            .eq('id', orderId)

        if (!error) {
            fetchOrders()
        } else {
            alert('Failed to update status')
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
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] p-2 bg-card rounded-lg overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Payment Proof"
                            className="max-w-full max-h-[85vh] object-contain rounded"
                        />
                    </div>
                </div>
            )}

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
                                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Proof</th>
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
                                            रू {order.amount.toLocaleString('en-NP')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.payment_proof_url ? (
                                                <button
                                                    onClick={() => setSelectedImage(order.payment_proof_url!)}
                                                    className="text-primary hover:underline text-sm font-medium"
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value, order.item_type)}
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
        </div >
    )
}
