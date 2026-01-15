'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search } from 'lucide-react'

interface Career {
    id: string
    title: string
    slug: string
    location: string | null
    department: string | null
    is_published: boolean
}

export default function CareersPage() {
    const [careers, setCareers] = useState<Career[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchCareers = async () => {
            const { data, error } = await supabase
                .from('careers')
                .select('*')
                .order('display_order', { ascending: true })

            if (!error && data) {
                setCareers(data as Career[])
            }
            setLoading(false)
        }

        fetchCareers()
    }, [supabase])

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('careers')
            .delete()
            .eq('id', id)

        if (!error) {
            setCareers(careers.filter(item => item.id !== id))
        }
        setDeleteConfirm(null)
    }

    const togglePublish = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('careers')
            .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
            .eq('id', id)

        if (!error) {
            setCareers(careers.map(item =>
                item.id === id ? { ...item, is_published: !currentStatus } : item
            ))
        }
    }

    const filteredCareers = careers.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Careers</h1>
                    <p className="text-muted-foreground mt-1">Manage job openings</p>
                </div>
                <Link
                    href="/admin/careers/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    New Role
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Location</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Department</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCareers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        {searchQuery ? 'No roles found' : 'No roles yet. Create your first role!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredCareers.map((item) => (
                                    <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="font-medium text-foreground">{item.title}</span>
                                                <div className="text-xs text-muted-foreground">{item.slug}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {item.location || 'Remote'}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {item.department || 'General'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublish(item.id, item.is_published)}
                                                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${item.is_published
                                                    ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                                                    }`}
                                            >
                                                {item.is_published ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/careers/${item.id}`}
                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteConfirm(item.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Role</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this role? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
