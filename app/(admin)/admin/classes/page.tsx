'use client'

import React, { useEffect, useState } from 'react'
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    FileText,
    ChevronLeft,
    ChevronRight,
    School
} from 'lucide-react'
import Link from 'next/link'
import { IClass } from '@/lib/mongodb/models/Class'

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<IClass[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [deleting, setDeleting] = useState<string | null>(null)

    const fetchClasses = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
            })

            const res = await fetch(`/api/admin/classes?${params}`)
            const data = await res.json()

            if (res.ok) {
                setClasses(data.classes)
                setTotalPages(data.pagination.totalPages)
                setTotal(data.pagination.total)
            } else {
                console.error('Failed to fetch classes:', data.error)
            }
        } catch (error) {
            console.error('Error fetching classes:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
    }, [page])

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (page === 1) fetchClasses()
            else setPage(1)
        }, 300)
        return () => clearTimeout(debounce)
    }, [search])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class?')) return

        setDeleting(id)
        try {
            const res = await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchClasses()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete class')
            }
        } catch (error) {
            console.error('Error deleting class:', error)
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage academic classes and courses ({total} total)
                    </p>
                </div>
                <Link
                    href="/admin/classes/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    New Class
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <School className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No classes found</h3>
                        <p className="text-muted-foreground mb-4">
                            {search ? 'Try adjusting your search' : 'Create your first class to get started'}
                        </p>
                        {!search && (
                            <Link
                                href="/admin/classes/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                            >
                                <Plus className="h-4 w-4" />
                                Create Class
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/30">
                                <tr>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Instructor</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Price</th>
                                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {classes.map((item) => (
                                    <tr key={item._id.toString()} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {item.thumbnailUrl ? (
                                                    <img
                                                        src={item.thumbnailUrl}
                                                        alt={item.title}
                                                        className="h-10 w-14 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-14 bg-secondary rounded flex items-center justify-center">
                                                        <School className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-foreground">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">/{item.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.instructor || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {item.price > 0 ? `${item.currency} ${item.price}` : 'Free'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {item.isActive ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/classes/${item._id}`}
                                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item._id.toString())}
                                                    disabled={deleting === item._id.toString()}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    {deleting === item._id.toString() ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 hover:bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
