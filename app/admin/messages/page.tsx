'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Trash2, Search, Phone, Calendar, CheckCircle } from 'lucide-react'

interface ContactMessage {
    id: string
    name: string
    email: string
    phone: string | null
    subject: string | null
    message: string
    company: string | null
    budget: string | null
    services: string[] | null
    website: string | null
    contact_method: string | null
    is_read: boolean
    created_at: string
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = createClient()

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching messages:', error)
        } else {
            setMessages(data || [])
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
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, is_read: !currentStatus })
            }
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
            setDeleteConfirm(null)
        }
    }

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">
                        Manage and respond to contact requests
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
                {/* Messages List */}
                <div className="md:col-span-1 bg-card rounded-xl border border-border flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full pl-9 pr-4 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="p-4 text-center text-muted-foreground">Loading...</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">No messages found</div>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-secondary/50 ${selectedMessage?.id === msg.id ? 'bg-secondary' : ''
                                        } ${!msg.is_read ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-medium truncate ${!msg.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {msg.name}
                                        </h3>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {new Date(msg.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground truncate mb-1">
                                        {msg.subject || '(No Subject)'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {msg.company || msg.email}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Message Detail */}
                <div className="md:col-span-2 bg-card rounded-xl border border-border p-6 h-full overflow-y-auto">
                    {selectedMessage ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-start pb-4 border-b border-border">
                                <div>
                                    <h2 className="text-2xl font-semibold text-foreground mb-1">
                                        {selectedMessage.subject || '(No Subject)'}
                                    </h2>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(selectedMessage.created_at).toLocaleString()}
                                        </span>
                                        {selectedMessage.is_read ? (
                                            <span className="flex items-center gap-1 text-green-500">
                                                <CheckCircle className="h-3 w-3" /> Read
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-primary">
                                                <Mail className="h-3 w-3" /> Unread
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm(selectedMessage.id)}
                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">
                                            Contact Method
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${selectedMessage.contact_method === 'phone' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {selectedMessage.contact_method || 'Email'}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedMessage.company && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground block mb-1">
                                                Company
                                            </label>
                                            <p className="text-foreground font-medium">{selectedMessage.company}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>

                                {selectedMessage.website && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">
                                            Website
                                        </label>
                                        <a
                                            href={selectedMessage.website.startsWith('http') ? selectedMessage.website : `https://${selectedMessage.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            {selectedMessage.website}
                                        </a>
                                    </div>
                                )}

                                {selectedMessage.budget && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-1">
                                            Estimated Budget
                                        </label>
                                        <p className="text-foreground font-medium">{selectedMessage.budget}</p>
                                    </div>
                                )}

                                {selectedMessage.services && selectedMessage.services.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground block mb-2">
                                            Interested Services
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMessage.services.map((service, index) => (
                                                <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">
                                        Project Details
                                    </label>
                                    <div className="bg-secondary/30 rounded-lg p-4">
                                        <p className="text-foreground whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
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
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
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
