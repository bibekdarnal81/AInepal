'use client'

import { useState } from 'react'
import { MessageSquare, User, Mail, Phone, ArrowRight } from 'lucide-react'
import type { GuestSession } from '@/lib/chat/guest-session-manager'
import { createGuestSession } from '@/lib/chat/guest-session-manager'

interface GuestChatFormProps {
    onSubmit: (session: GuestSession) => void
}

export function GuestChatForm({ onSubmit }: GuestChatFormProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !email.trim() || !message.trim()) return

        setLoading(true)
        try {
            const session = await createGuestSession({
                name,
                email,
                phone,
                question: message
            })

            if (session) {
                onSubmit(session)
            }
        } catch (error) {
            console.error('Error creating guest session:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 rot-3 hover:rotate-0 transition-all duration-300 shadow-lg">
                    <MessageSquare className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start a Conversation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fill out the form below to start chatting with our team.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                        Phone <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="+977 9800000000"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Message</label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="block w-full px-4 py-3 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        placeholder="How can we help you today?"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-emerald-600 to-cyan-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            Start Chatting
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
