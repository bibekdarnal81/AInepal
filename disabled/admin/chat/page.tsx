'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, User, MessageSquare } from 'lucide-react'
import Image from 'next/image'

interface ChatMessage {
    id: string
    user_id: string | null
    guest_session_id: string | null
    message: string
    is_admin: boolean
    is_read: boolean
    created_at: string
}

interface GuestSession {
    id: string
    guest_name: string
    guest_email: string
    guest_phone: string | null
}

interface UserWithMessages {
    user_id: string | null
    guest_session_id: string | null
    display_name: string
    avatar_url: string
    unread_count: number
    last_message: string
    last_message_time: string
    is_guest: boolean
    guest_email?: string
    guest_phone?: string
}

export default function AdminChatPage() {
    const [users, setUsers] = useState<UserWithMessages[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [selectedGuestSessionId, setSelectedGuestSessionId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [adminAvatar, setAdminAvatar] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchAdminProfile()
        fetchUsers()
        const cleanup = subscribeToNewMessages()
        return cleanup
    }, [])

    useEffect(() => {
        if (selectedUserId || selectedGuestSessionId) {
            fetchMessages(selectedUserId, selectedGuestSessionId)
            markMessagesAsRead(selectedUserId, selectedGuestSessionId)
        }
    }, [selectedUserId, selectedGuestSessionId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchAdminProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single()

            if (profile) {
                setAdminAvatar(profile.avatar_url || '')
            }
        }
    }

    const fetchUsers = async () => {
        try {
            // Get all chat messages
            const { data: messagesData, error: messagesError } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })

            if (messagesError) {
                console.error('Error fetching chat messages:', messagesError)
                setLoading(false)
                return
            }

            if (messagesData && messagesData.length > 0) {
                // Get unique user IDs and guest session IDs
                const userIds = [...new Set(messagesData.filter(m => m.user_id).map(m => m.user_id))]
                const guestSessionIds = [...new Set(messagesData.filter(m => m.guest_session_id).map(m => m.guest_session_id))]

                // Fetch registered user profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url')
                    .in('id', userIds)

                // Fetch guest sessions
                const { data: guestSessionsData } = await supabase
                    .from('guest_chat_sessions')
                    .select('*')
                    .in('id', guestSessionIds)

                // Create profile and guest maps
                const profileMap = new Map(profilesData?.map(p => [p.id, p]) || [])
                const guestMap = new Map(guestSessionsData?.map(g => [g.id, g]) || [])

                // Group by user_id or guest_session_id
                const userMap = new Map<string, UserWithMessages>()

                messagesData.forEach((msg: any) => {
                    const key = msg.user_id || msg.guest_session_id
                    if (!key) return

                    // Only add if this is the first message for this user/guest
                    if (!userMap.has(key)) {
                        const unreadCount = messagesData.filter(
                            (m: any) => ((m.user_id === msg.user_id && m.user_id) || (m.guest_session_id === msg.guest_session_id && m.guest_session_id)) && !m.is_read && !m.is_admin
                        ).length

                        if (msg.user_id) {
                            // Registered user
                            const profile = profileMap.get(msg.user_id)
                            userMap.set(key, {
                                user_id: msg.user_id,
                                guest_session_id: null,
                                display_name: profile?.display_name || 'Unknown User',
                                avatar_url: profile?.avatar_url || '',
                                unread_count: unreadCount,
                                last_message: msg.message,
                                last_message_time: msg.created_at,
                                is_guest: false
                            })
                        } else if (msg.guest_session_id) {
                            // Guest user
                            const guestSession = guestMap.get(msg.guest_session_id)
                            userMap.set(key, {
                                user_id: null,
                                guest_session_id: msg.guest_session_id,
                                display_name: guestSession?.guest_name || 'Guest User',
                                avatar_url: '',
                                unread_count: unreadCount,
                                last_message: msg.message,
                                last_message_time: msg.created_at,
                                is_guest: true,
                                guest_email: guestSession?.guest_email,
                                guest_phone: guestSession?.guest_phone || undefined
                            })
                        }
                    }
                })

                setUsers(Array.from(userMap.values()))
            } else {
                setUsers([]) // No messages, so no users to display
            }
        } catch (err) {
            console.error('Unexpected error fetching chat users:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (userId: string | null, guestSessionId: string | null) => {
        const query = supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true })

        if (userId) {
            query.eq('user_id', userId)
        } else if (guestSessionId) {
            query.eq('guest_session_id', guestSessionId)
        } else {
            return
        }

        const { data } = await query

        if (data) {
            setMessages(data)
        }
    }

    const markMessagesAsRead = async (userId: string | null, guestSessionId: string | null) => {
        const query = supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('is_admin', false)
            .eq('is_read', false)

        if (userId) {
            query.eq('user_id', userId)
        } else if (guestSessionId) {
            query.eq('guest_session_id', guestSessionId)
        } else {
            return
        }

        await query

        // Refresh users list
        fetchUsers()
    }

    const subscribeToNewMessages = () => {
        console.log('🔔 Setting up admin chat subscriptions...')

        const channel = supabase
            .channel('admin_chat_all')
            .on('postgres_changes', {
                event: '*', // Listen to all events
                schema: 'public',
                table: 'chat_messages',
            }, (payload) => {
                console.log('📨 Message change detected:', payload.eventType)
                fetchUsers()
                if (selectedUserId || selectedGuestSessionId) {
                    fetchMessages(selectedUserId, selectedGuestSessionId)
                }
            })
            .subscribe((status) => {
                console.log('📡 Subscription status:', status)
            })

        return () => {
            console.log('🔌 Cleaning up subscription')
            supabase.removeChannel(channel)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || (!selectedUserId && !selectedGuestSessionId)) return

        const messageData: any = {
            message: newMessage.trim(),
            is_admin: true,
            is_read: false
        }

        if (selectedUserId) {
            messageData.user_id = selectedUserId
        } else if (selectedGuestSessionId) {
            messageData.guest_session_id = selectedGuestSessionId
        }

        const { error } = await supabase
            .from('chat_messages')
            .insert(messageData)

        if (!error) {
            setNewMessage('')
        }
    }

    const selectedUser = users.find(u =>
        (u.user_id && u.user_id === selectedUserId) ||
        (u.guest_session_id && u.guest_session_id === selectedGuestSessionId)
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
            <div>
                <h1 className="text-3xl font-bold text-foreground">Live Chat</h1>
                <p className="text-muted-foreground mt-1">Manage customer conversations</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Users List */}
                <div className="lg:col-span-1 bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-semibold text-foreground">Conversations</h2>
                    </div>
                    <div className="overflow-y-auto h-full">
                        {users.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No conversations yet</p>
                            </div>
                        ) : (
                            users.map((user) => (
                                <button
                                    key={user.user_id || user.guest_session_id}
                                    onClick={() => {
                                        if (user.user_id) {
                                            setSelectedUserId(user.user_id)
                                            setSelectedGuestSessionId(null)
                                        } else if (user.guest_session_id) {
                                            setSelectedGuestSessionId(user.guest_session_id)
                                            setSelectedUserId(null)
                                        }
                                    }}
                                    className={`w-full p-4 border-b border-border hover:bg-secondary/50 transition-colors text-left ${(
                                        (user.user_id && selectedUserId === user.user_id) ||
                                        (user.guest_session_id && selectedGuestSessionId === user.guest_session_id)
                                    ) ? 'bg-secondary' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${user.is_guest
                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                            : 'bg-gradient-to-br from-violet-500 to-pink-500'
                                            }`}>
                                            {user.avatar_url ? (
                                                <Image
                                                    src={user.avatar_url}
                                                    alt={user.display_name}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-foreground truncate">
                                                    {user.display_name}
                                                </p>
                                                {user.is_guest && (
                                                    <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                                                        Guest
                                                    </span>
                                                )}
                                                {user.unread_count > 0 && (
                                                    <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                                        {user.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {user.is_guest ? (
                                                <div className="space-y-0.5">
                                                    {user.guest_email && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            📧 {user.guest_email}
                                                        </p>
                                                    )}
                                                    {user.guest_phone && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            📱 {user.guest_phone}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    Registered User
                                                </p>
                                            )}
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user.last_message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(user.last_message_time).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border flex flex-col">
                    {(selectedUserId || selectedGuestSessionId) ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${selectedUser?.is_guest
                                        ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                                        : 'bg-gradient-to-br from-violet-500 to-pink-500'
                                        }`}>
                                        {selectedUser?.avatar_url ? (
                                            <Image
                                                src={selectedUser.avatar_url}
                                                alt={selectedUser.display_name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-foreground">
                                                {selectedUser?.display_name}
                                            </h3>
                                            {selectedUser?.is_guest ? (
                                                <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                                                    Guest User
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs bg-violet-500 text-white rounded-full">
                                                    Registered
                                                </span>
                                            )}
                                        </div>
                                        {selectedUser?.is_guest ? (
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                {selectedUser?.guest_email && (
                                                    <p className="text-xs text-muted-foreground">
                                                        📧 {selectedUser.guest_email}
                                                    </p>
                                                )}
                                                {selectedUser?.guest_phone && (
                                                    <p className="text-xs text-muted-foreground">
                                                        📱 {selectedUser.guest_phone}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground mt-1">Registered User</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-2 ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {/* User avatar on left for customer messages */}
                                        {!msg.is_admin && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {selectedUser?.avatar_url ? (
                                                    <Image
                                                        src={selectedUser.avatar_url}
                                                        alt={selectedUser.display_name}
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-4 w-4 text-white" />
                                                )}
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.is_admin
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-foreground'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {new Date(msg.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        {/* Admin avatar on right for admin messages */}
                                        {msg.is_admin && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {adminAvatar ? (
                                                    <Image
                                                        src={adminAvatar}
                                                        alt="Admin"
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="h-4 w-4 text-white" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Select a conversation to start</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
