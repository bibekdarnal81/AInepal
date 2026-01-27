'use client'

import React, { useEffect, useState } from 'react'
import { Search, Loader2, ChevronLeft, ChevronRight, ShoppingCart, Check, X, Clock, RotateCcw } from 'lucide-react'

interface Order {
    id: string; userEmail?: string; userName?: string; itemType: string; itemTitle: string
    amount: number; currency: string; status: string; paymentMethod?: string; createdAt: string
}

const statusColors: Record<string, string> = { pending: 'bg-yellow-500/10 text-yellow-500', paid: 'bg-green-500/10 text-green-500', cancelled: 'bg-red-500/10 text-red-500', refunded: 'bg-gray-500/10 text-gray-500' }
const statusIcons: Record<string, React.ReactNode> = { pending: <Clock className="h-3 w-3" />, paid: <Check className="h-3 w-3" />, cancelled: <X className="h-3 w-3" />, refunded: <RotateCcw className="h-3 w-3" /> }

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(statusFilter && { status: statusFilter }), ...(typeFilter && { itemType: typeFilter }) })
            const res = await fetch(`/api/admin/orders?${params}`)
            const data = await res.json()
            if (res.ok) { setOrders(data.orders); setTotalPages(data.pagination.totalPages); setTotal(data.pagination.total) }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [page, statusFilter, typeFilter])

    const updateStatus = async (id: string, status: string) => {
        try { await fetch('/api/admin/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); fetchData() }
        catch (e) { console.error(e) }
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold">Orders</h1><p className="text-muted-foreground mt-1">Manage customer orders ({total})</p></div>

            <div className="flex flex-col md:flex-row gap-4">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg">
                    <option value="">All Status</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg">
                    <option value="">All Types</option>
                    <option value="service">Service</option>
                    <option value="course">Course</option>
                    <option value="hosting">Hosting</option>
                    <option value="domain">Domain</option>
                    <option value="membership">Membership</option>
                </select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : orders.length === 0 ? (
                    <div className="flex flex-col items-center py-20"><ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No orders</h3></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30"><tr><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Order</th><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Customer</th><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th><th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th></tr></thead>
                        <tbody className="divide-y divide-border">
                            {orders.map(o => (
                                <tr key={o.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3"><p className="font-medium">{o.itemTitle}</p><p className="text-xs text-muted-foreground capitalize">{o.itemType}</p></td>
                                    <td className="px-4 py-3"><p className="text-sm">{o.userName || o.userEmail || 'Unknown'}</p></td>
                                    <td className="px-4 py-3 font-medium">{o.currency} {o.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className={`px-2 py-1 rounded-full text-xs ${statusColors[o.status]} bg-transparent border-0 cursor-pointer`}>
                                            <option value="pending">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option><option value="refunded">Refunded</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {totalPages > 1 && <div className="flex items-center justify-between px-4 py-3 border-t border-border"><p className="text-sm text-muted-foreground">Page {page}/{totalPages}</p><div className="flex gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button></div></div>}
            </div>
        </div>
    )
}
