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
        // ... (rest of the component state)

        // ... (rest of the component logic)

        < div className = "space-y-4" >
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

    {
        selectedMessage.website && (
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
        )
    }

    {
        selectedMessage.budget && (
            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Estimated Budget
                </label>
                <p className="text-foreground font-medium">{selectedMessage.budget}</p>
            </div>
        )
    }

    {
        selectedMessage.services && selectedMessage.services.length > 0 && (
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
        )
    }

    {
        selectedMessage.subject && (
            <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Subject
                </label>
                <p className="text-foreground">{selectedMessage.subject}</p>
            </div>
        )
    }

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
                            </div >

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
                        </div >
                    ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-50" />
            <p>Select a message to view details</p>
        </div>
    )
}
                </div >
            </div >

    {/* Delete Confirmation Modal */ }
{
    deleteConfirm && (
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
    )
}
        </div >
    )
}
