'use client'

import React, { useEffect, useState } from 'react'
import { Search, Loader2, ChevronLeft, ChevronRight, Users, Shield, ShieldOff, User, Trash2, Ban, CheckCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface UserData {
    id: string
    email: string
    displayName?: string
    avatarUrl?: string
    phone?: string
    isAdmin: boolean
    isSuspended: boolean
    emailVerified?: string
    createdAt: string
    membershipId?: string | null
    membershipStatus?: 'none' | 'active' | 'trialing' | 'canceled' | 'expired'
    membershipExpiresAt?: string | null
}

interface Membership {
    id: string
    name: string
    durationDays: number
    isActive: boolean
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [adminFilter, setAdminFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [memberships, setMemberships] = useState<Membership[]>([])

    const fetchData = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(search && { search }), ...(adminFilter && { isAdmin: adminFilter }) })
            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()
            if (res.ok) { setUsers(data.users); setTotalPages(data.pagination.totalPages); setTotal(data.pagination.total) }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const fetchMemberships = async () => {
        try {
            const res = await fetch('/api/admin/memberships?status=active&limit=200')
            const data = await res.json()
            if (res.ok) setMemberships(data.memberships || [])
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => { fetchData() }, [page, adminFilter])
    useEffect(() => { const t = setTimeout(() => { page === 1 ? fetchData() : setPage(1) }, 300); return () => clearTimeout(t) }, [search])
    useEffect(() => { fetchMemberships() }, [])

    const toggleAdmin = async (id: string, currentStatus: boolean) => {
        if (!confirm(`${currentStatus ? 'Remove' : 'Grant'} admin privileges?`)) return
        try { await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isAdmin: !currentStatus }) }); fetchData() }
        catch (e) { console.error(e) }
    }

    const toggleSuspended = async (id: string, currentStatus: boolean) => {
        if (!confirm(`${currentStatus ? 'Activate' : 'Suspend'} this user?`)) return
        try { await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isSuspended: !currentStatus }) }); fetchData() }
        catch (e) { console.error(e) }
    }

    const deleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
            if (res.ok) fetchData()
            else alert('Failed to delete user')
        }
        catch (e) { console.error(e) }
    }

    const updateMembership = async (id: string, membershipId: string | null, membershipStatus: string) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, membershipId, membershipStatus }),
            })
            fetchData()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold">Users</h1><p className="text-muted-foreground mt-1">Manage registered users ({total})</p></div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg" /></div>
                <select value={adminFilter} onChange={e => setAdminFilter(e.target.value)} className="px-4 py-2 bg-card border border-border rounded-lg"><option value="">All Users</option><option value="true">Admins Only</option><option value="false">Non-Admins</option></select>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : users.length === 0 ? (
                    <div className="flex flex-col items-center py-20"><Users className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No users found</h3></div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-secondary/30">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Membership</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Expires</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-secondary/20">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><User className="h-5 w-5 text-muted-foreground" /></div>}
                                            <span className="font-medium">{u.displayName || 'No name'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={u.membershipId || ''}
                                            onChange={e => updateMembership(u.id, e.target.value || null, e.target.value ? 'active' : 'none')}
                                            className="px-3 py-2 bg-card border border-border rounded-lg text-sm"
                                        >
                                            <option value="">No membership</option>
                                            {memberships.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={u.membershipStatus || 'none'}
                                            disabled={!u.membershipId}
                                            onChange={e => updateMembership(u.id, u.membershipId || null, e.target.value)}
                                            className="px-3 py-2 bg-card border border-border rounded-lg text-sm disabled:opacity-60"
                                        >
                                            <option value="none">None</option>
                                            <option value="active">Active</option>
                                            <option value="trialing">Trialing</option>
                                            <option value="canceled">Canceled</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {u.membershipExpiresAt ? new Date(u.membershipExpiresAt).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.isAdmin ? <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"><Shield className="h-3 w-3" /> Admin</span> : <span className="text-muted-foreground text-sm">User</span>}
                                        {u.isSuspended && <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium"><Ban className="h-3 w-3" /> Suspended</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => toggleAdmin(u.id, u.isAdmin)} className={`p-2 rounded-lg transition-colors ${u.isAdmin ? 'hover:bg-red-500/10 text-red-500' : 'hover:bg-green-500/10 text-green-500'}`} title={u.isAdmin ? 'Remove admin' : 'Make admin'}>{u.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}</button>
                                            <button onClick={() => toggleSuspended(u.id, u.isSuspended)} className={`p-2 rounded-lg transition-colors ${u.isSuspended ? 'hover:bg-green-500/10 text-green-500' : 'hover:bg-orange-500/10 text-orange-500'}`} title={u.isSuspended ? 'Activate user' : 'Suspend user'}>{u.isSuspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</button>
                                            <Link href={`/admin/chat?userId=${u.id}`} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors" title="Message user"><MessageSquare className="h-4 w-4" /></Link>
                                            <button onClick={() => deleteUser(u.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete user"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
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
