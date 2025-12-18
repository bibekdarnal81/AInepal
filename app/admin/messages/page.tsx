'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Trash2, Search, Eye, EyeOff, Phone, Calendar } from 'lucide-react'

interface ContactMessage {
    id: string
    name: string
    email: string
    phone: string | null
    subject: string | null
    message: string
    is_read: boolean
    created_at: string
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setMessages(data)
        }
        setLoading(false)
    }

    const toggleReadStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('contact_messages')
            .update({ is_read: !currentStatus })
            .eq('id', id)

        if (!error) {
            setMessages(messages.map(msg =>
                msg.id === id ? { ...msg, is_read: !currentStatus } : msg
            ))
        }
    }

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id)

        if (!error) {
            setMessages(messages.filter(msg => msg.id !== id))
            if (selectedMessage?.id === id) {
                setSelectedMessage(null)
            }
        }
        setDeleteConfirm(null)
    }

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const unreadCount = messages.filter(msg => !msg.is_read).length

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
                    <h1 className="text-3xl font-bold text-foreground">Contact Messages</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage messages from your contact form
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Messages List */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                        {filteredMessages.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                {searchQuery ? 'No messages found' : 'No messages yet'}
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {filteredMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        onClick={() => setSelectedMessage(message)}
                                        className={`p-6 cursor-pointer transition-colors hover:bg-secondary/30 ${selectedMessage?.id === message.id ? 'bg-secondary/50' : ''
                                            } ${!message.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-foreground truncate">
                                                        {message.name}
                                                    </h3>
                                                    {!message.is_read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {message.email}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleReadStatus(message.id, message.is_read)
                                                }}
                                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                                title={message.is_read ? 'Mark as unread' : 'Mark as read'}
                                            >
                                                {message.is_read ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {message.subject && (
                                            <p className="text-sm font-medium text-foreground mb-2 truncate">
                                                {message.subject}
                                            </p>
                                        )}
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                            {message.message}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(message.created_at)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="bg-card rounded-xl border border-border p-6">
                    {selectedMessage ? (
                        <div className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">
                                            {selectedMessage.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(selectedMessage.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm(selectedMessage.id)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete message"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-1">
                                        Email
                                    </label>
                                    <a
                                        href={`mailto:${selectedMessage.email}`}
                                        className="text-foreground hover:text-primary transition-colors"
                                    >
                                        {selectedMessage.email}
                                    </a>
                                </div>

                                {selectedMessage.phone && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">
                                            Phone
                                        </label>
                                        <a
                                            href={`tel:${selectedMessage.phone}`}
                                            className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <Phone className="h-4 w-4" />
                                            {selectedMessage.phone}
                                        </a>
                                    </div>
                                )}

                                {selectedMessage.subject && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">
                                            Subject
                                        </label>
                                        <p className="text-foreground">{selectedMessage.subject}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                                        Message
                                    </label>
                                    <div className="bg-secondary/30 rounded-lg p-4">
                                        <p className="text-foreground whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button
                                    onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.is_read)}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${selectedMessage.is_read
                                            ? 'bg-secondary text-foreground hover:bg-secondary/80'
                                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        }`}
                                >
                                    {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                                </button>
                                <a
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                                >
                                    Reply via Email
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Mail className="h-12 w-12 mb-4 opacity-50" />
                            <p>Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Delete Message</h3>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this message? This action cannot be undone.
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
