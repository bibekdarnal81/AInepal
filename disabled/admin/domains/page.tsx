'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Network, Calendar, User, AlertCircle } from 'lucide-react'

interface Domain {
    id: string
    user_id: string
    domain_name: string
    tld: string
    registrar: string
    price: number
    status: string
    registered_at: string | null
    expires_at: string | null
    auto_renew: boolean
    created_at: string
    profiles: {
        email: string
    } | null
}

export default function DomainsAdminPage() {
    const [domains, setDomains] = useState<Domain[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')
    const supabase = createClient()

    useEffect(() => {
        fetchDomains()
    }, [filter])

    const fetchDomains = async () => {
        console.log('[Domains Admin] Fetching domains with filter:', filter)

        let query = supabase
            .from('domains')
            .select(`
                *,
                profiles (email)
            `)
            .order('created_at', { ascending: false })

        if (filter !== 'all') {
            query = query.eq('status', filter)
        }

        const { data, error } = await query

        console.log('[Domains Admin] Query result:', { data, error, count: data?.length })

        if (error) {
            console.error('[Domains Admin] Error fetching domains:', error)
        }

        if (!error && data) {
            setDomains(data as any)
        }
        setLoading(false)
    }

    const updateDomainStatus = async (domainId: string, newStatus: string) => {
        const { error } = await supabase
            .from('domains')
            .update({ status: newStatus })
            .eq('id', domainId)

        if (!error) {
            fetchDomains()
        }
    }

    const toggleAutoRenew = async (domainId: string, currentValue: boolean) => {
        const { error } = await supabase
            .from('domains')
            .update({ auto_renew: !currentValue })
            .eq('id', domainId)

        if (!error) {
            fetchDomains()
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/10 text-green-500'
            case 'pending': return 'bg-yellow-500/10 text-yellow-500'
            case 'expired': return 'bg-red-500/10 text-red-500'
            case 'cancelled': return 'bg-gray-500/10 text-gray-500'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    const getDaysUntilExpiry = (expiresAt: string | null) => {
        if (!expiresAt) return null
        const days = Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Domain Management</h1>
                <p className="text-muted-foreground">Manage registered domains and renewals</p>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'active', 'expired', 'cancelled'].map((status) => (
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
            ) : domains.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Network className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No domains found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {domains.map((domain) => {
                        const daysUntilExpiry = getDaysUntilExpiry(domain.expires_at)
                        const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry < 30

                        return (
                            <div
                                key={domain.id}
                                className="bg-card border border-border rounded-xl p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-foreground">
                                                {domain.domain_name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(domain.status)}`}>
                                                {domain.status}
                                            </span>
                                            {isExpiringSoon && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Expires in {daysUntilExpiry} days
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Registrar: {domain.registrar}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-foreground">
                                            रू {domain.price.toLocaleString('en-NP')}
                                        </div>
                                        <div className="text-sm text-muted-foreground">/year</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-foreground">{domain.profiles?.email || 'Unknown User'}</span>
                                    </div>
                                    {domain.registered_at && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                Registered: {new Date(domain.registered_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {domain.expires_at && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className={isExpiringSoon ? 'text-orange-500 font-medium' : 'text-muted-foreground'}>
                                                Expires: {new Date(domain.expires_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleAutoRenew(domain.id, domain.auto_renew)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${domain.auto_renew
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                                            }`}
                                    >
                                        Auto-renew: {domain.auto_renew ? 'ON' : 'OFF'}
                                    </button>
                                    {['pending', 'active', 'expired', 'cancelled'].map((status) => (
                                        domain.status !== status && (
                                            <button
                                                key={status}
                                                onClick={() => updateDomainStatus(domain.id, status)}
                                                className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                                            >
                                                Mark as {status}
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
