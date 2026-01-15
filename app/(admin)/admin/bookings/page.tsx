'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Filter,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Globe,
    Building2,
    User,
    Eye,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Briefcase,
    ChevronDown,
    RefreshCw
} from 'lucide-react'

interface Booking {
    id: string
    name: string
    company: string | null
    email: string
    phone: string | null
    subject: string | null
    message: string
    budget: string | null
    services: string[]
    website: string | null
    contact_method: 'email' | 'phone'
    is_read: boolean
    status?: 'pending' | 'contacted' | 'resolved' | 'cancelled'
    created_at: string
}

const SERVICE_OPTIONS = [
    'Website Design & Development',
    'Custom CMS Website',
    'eCommerce Website',
    'Custom Web Application',
    'Mobile Applications',
    'Search Engine Optimisation (SEO)',
    'Social Media Marketing',
    'Website Maintenance',
    'Branding',
    'Web Hosting',
    'Others'
]

export default function BookingManagementPage() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all')
    const [serviceFilter, setServiceFilter] = useState<string>('all')
    const [refreshing, setRefreshing] = useState(false)

    const fetchBookings = async () => {
        try {
            setRefreshing(true)
            const params = new URLSearchParams()
            if (statusFilter !== 'all') params.append('status', statusFilter)
            if (serviceFilter !== 'all') params.append('service', serviceFilter)
            if (searchTerm) params.append('search', searchTerm)

            const response = await fetch(`/api/admin/bookings?${params.toString()}`)
            const data = await response.json()

            if (response.ok) {
                setBookings(data.bookings || [])
                setFilteredBookings(data.bookings || [])
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [statusFilter, serviceFilter])

    useEffect(() => {
        // Local search filtering
        if (searchTerm) {
            const filtered = bookings.filter(
                (booking) =>
                    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    booking.message.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredBookings(filtered)
        } else {
            setFilteredBookings(bookings)
        }
    }, [searchTerm, bookings])

    const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/admin/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_read: !currentStatus })
            })

            if (response.ok) {
                fetchBookings()
                if (selectedBooking?.id === id) {
                    setSelectedBooking({ ...selectedBooking, is_read: !currentStatus })
                }
            }
        } catch (error) {
            console.error('Error updating booking:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this booking?')) return

        try {
            const response = await fetch(`/api/admin/bookings?id=${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchBookings()
                if (selectedBooking?.id === id) {
                    setSelectedBooking(null)
                }
            }
        } catch (error) {
            console.error('Error deleting booking:', error)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (booking: Booking) => {
        if (!booking.is_read) return 'bg-blue-500'
        return 'bg-green-500'
    }

    const getStatusText = (booking: Booking) => {
        if (!booking.is_read) return 'New'
        return 'Read'
    }

    const unreadCount = bookings.filter((b) => !b.is_read).length

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-primary" />
                                Booking Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and track all demo requests
                                {unreadCount > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        {unreadCount} new
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={fetchBookings}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full pl-10 pr-10 py-2.5 bg-secondary/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        {/* Service Filter */}
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-secondary/30 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Services</option>
                                {SERVICE_OPTIONS.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-20">
                        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No bookings found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No demo requests have been submitted yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bookings List */}
                        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                            {filteredBookings.map((booking) => (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 bg-card border rounded-xl cursor-pointer transition-all hover:shadow-lg ${selectedBooking?.id === booking.id
                                            ? 'border-primary shadow-md'
                                            : 'border-border hover:border-primary/50'
                                        } ${!booking.is_read ? 'bg-primary/5' : ''}`}
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">
                                                    {booking.name}
                                                </h3>
                                                {!booking.is_read && (
                                                    <span className={`w-2 h-2 rounded-full ${getStatusColor(booking)}`} />
                                                )}
                                            </div>
                                            {booking.company && (
                                                <p className="text-sm text-muted-foreground">{booking.company}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                        {booking.message}
                                    </p>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {booking.services.slice(0, 2).map((service, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                        {booking.services.length > 2 && (
                                            <span className="text-xs text-muted-foreground">
                                                +{booking.services.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Booking Details */}
                        <div className="lg:col-span-2">
                            {selectedBooking ? (
                                <motion.div
                                    key={selectedBooking.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-card border border-border rounded-xl overflow-hidden"
                                >
                                    {/* Detail Header */}
                                    <div className="p-6 border-b border-border bg-muted/40">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                                    {selectedBooking.name}
                                                    {!selectedBooking.is_read && (
                                                        <span className="text-sm font-normal px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                                            New
                                                        </span>
                                                    )}
                                                </h2>
                                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4" />
                                                    {formatDate(selectedBooking.created_at)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleMarkAsRead(selectedBooking.id, selectedBooking.is_read)
                                                    }
                                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                                    title={selectedBooking.is_read ? 'Mark as unread' : 'Mark as read'}
                                                >
                                                    {selectedBooking.is_read ? (
                                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(selectedBooking.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete booking"
                                                >
                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detail Body */}
                                    <div className="p-6 space-y-6">
                                        {/* Contact Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                Contact Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                                    <User className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Name</p>
                                                        <p className="font-medium text-foreground">{selectedBooking.name}</p>
                                                    </div>
                                                </div>

                                                {selectedBooking.company && (
                                                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                                        <Building2 className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Company</p>
                                                            <p className="font-medium text-foreground">
                                                                {selectedBooking.company}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                                    <Mail className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Email</p>
                                                        <a
                                                            href={`mailto:${selectedBooking.email}`}
                                                            className="font-medium text-primary hover:underline"
                                                        >
                                                            {selectedBooking.email}
                                                        </a>
                                                    </div>
                                                </div>

                                                {selectedBooking.phone && (
                                                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                                        <Phone className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Phone</p>
                                                            <a
                                                                href={`tel:${selectedBooking.phone}`}
                                                                className="font-medium text-primary hover:underline"
                                                            >
                                                                {selectedBooking.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Preferred Contact</p>
                                                        <p className="font-medium text-foreground capitalize">
                                                            {selectedBooking.contact_method}
                                                        </p>
                                                    </div>
                                                </div>

                                                {selectedBooking.website && (
                                                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                                                        <Globe className="h-5 w-5 text-primary" />
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Website</p>
                                                            <a
                                                                href={`https://${selectedBooking.website.replace(/^https?:\/\//, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium text-primary hover:underline"
                                                            >
                                                                {selectedBooking.website}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Project Details */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                Project Details
                                            </h3>

                                            {/* Services */}
                                            <div className="mb-4">
                                                <p className="text-sm text-muted-foreground mb-2">Interested Services</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedBooking.services.map((service, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                                                        >
                                                            {service}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Budget */}
                                            {selectedBooking.budget && (
                                                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg mb-4">
                                                    <DollarSign className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Estimated Budget</p>
                                                        <p className="font-medium text-foreground">{selectedBooking.budget}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Message */}
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-2">Project Description</p>
                                                <div className="p-4 bg-secondary/30 rounded-lg">
                                                    <p className="text-foreground whitespace-pre-wrap">
                                                        {selectedBooking.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 pt-4 border-t border-border">
                                            <a
                                                href={`mailto:${selectedBooking.email}?subject=Re: ${selectedBooking.subject || 'Demo Request'}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium"
                                            >
                                                <Mail className="h-5 w-5" />
                                                Reply via Email
                                            </a>
                                            {selectedBooking.phone && (
                                                <a
                                                    href={`tel:${selectedBooking.phone}`}
                                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all font-medium"
                                                >
                                                    <Phone className="h-5 w-5" />
                                                    Call
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-card border border-border rounded-xl">
                                    <div className="text-center">
                                        <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            Select a booking to view details
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Click on any booking from the list to see full details
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
