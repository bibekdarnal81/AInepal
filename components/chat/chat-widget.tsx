'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Paperclip, DollarSign, User as UserIcon, ShoppingBag, BookOpen, Bot, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { createGuestSession, getGuestSessionFromStorage, isValidEmail, isValidPhone, type GuestSession } from '@/lib/chat/guest-session-manager'
import { CatalogBrowse } from '../catalog/catalog-browse'
import { GuestChatForm } from './guest-chat-form'

interface Order {
    id: string
    item_type: string
    item_title: string
    amount: number
    currency: string
    status: string
    created_at: string
}

interface ChatMessage {
    id: string
    message: string
    is_admin: boolean
    is_ai_response?: boolean
    created_at: string
    attachments?: Array<{
        file_url: string
        file_type: string
    }>
}

interface UserProfile {
    display_name: string
    avatar_url: string
    id: string
}

interface User {
    id: string
    email?: string
    name?: string
    image?: string
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [user, setUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [guestSession, setGuestSession] = useState<GuestSession | null>(null)
    const [showGuestForm, setShowGuestForm] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)

    const [showOrdersView, setShowOrdersView] = useState(false)
    const [showCatalogView, setShowCatalogView] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [uploading, setUploading] = useState(false)
    const [adminAvatar, setAdminAvatar] = useState<string>('')
    const [aiEnabled, setAiEnabled] = useState(true)
    const [aiTyping, setAiTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pollingInterval = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const init = async () => {
            const currentUser = await checkUser()
            checkGuestSession(currentUser)
        }
        init()
        return () => stopPolling()
    }, [])

    useEffect(() => {
        if ((user || guestSession) && isOpen) {
            if (user) {
                // fetchUserProfile() // User profile info is mainly from session now
                fetchAdminProfile()
            }
            fetchMessages()
            startPolling()
        } else {
            stopPolling()
        }
    }, [user, guestSession, isOpen])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Listen for custom event to open chat with pre-filled message
    useEffect(() => {
        const handleOpenChatWithMessage = (event: CustomEvent) => {
            const { itemType, itemTitle } = event.detail
            setIsOpen(true)
            setNewMessage(`Hi! I want to know more about the ${itemType}: "${itemTitle}". Can you provide more information?`)
        }

        window.addEventListener('openChatWithMessage' as any, handleOpenChatWithMessage as any)
        return () => {
            window.removeEventListener('openChatWithMessage' as any, handleOpenChatWithMessage as any)
        }
    }, [])

    const startPolling = () => {
        if (pollingInterval.current) return
        pollingInterval.current = setInterval(() => {
            fetchMessages()
        }, 3000) // Poll every 3 seconds
    }

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current)
            pollingInterval.current = null
        }
    }

    const checkUser = async () => {
        try {
            const response = await fetch('/api/auth/session')
            const session = await response.json()
            console.log('Chat widget - session check:', session?.user?.id, session?.user?.email);
            if (session?.user) {
                const userData = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    image: session.user.image
                }
                setUser(userData)
                setUserProfile({
                    id: session.user.id,
                    display_name: session.user.name || 'User',
                    avatar_url: session.user.image || ''
                })
                return userData
            }
        } catch (error) {
            console.error('Error checking user session:', error)
        }
        return null
    }

    const checkGuestSession = (currentUser: any) => {
        const session = getGuestSessionFromStorage()
        if (session) {
            setGuestSession(session)
            setShowGuestForm(false)
        } else if (!currentUser) {
            setShowGuestForm(true)
        }
    }

    const fetchAdminProfile = async () => {
        // Simplified: Use a default admin avatar or fetch if needed
        // For now, hardcoded placeholder or logic can go here
        setAdminAvatar('https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff')
    }

    const fetchOrders = async () => {
        if (!user) return

        try {
            const response = await fetch('/api/orders')
            if (response.ok) {
                const data = await response.json()
                setOrders(data)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const fetchMessages = async () => {
        if (!user && !guestSession) return

        let url = '/api/chat/messages?'
        if (user) {
            url += `userId=${user.id}`
        } else if (guestSession) {
            url += `guestSessionId=${guestSession.id}`
        }

        try {
            const response = await fetch(url)
            if (response.ok) {
                const data = await response.json()
                // Only update if messages have changed to avoid re-renders/scroll jumps
                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(data)) {
                        return data
                    }
                    return prev
                })
            }
        } catch (error) {
            console.error('Error fetching messages:', error)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!newMessage.trim() && !selectedImage) || (!user && !guestSession)) return

        setUploading(true)
        const userMessageText = newMessage.trim()

        try {
            let imageUrl = null

            // Upload image first if selected
            if (selectedImage) {
                const formData = new FormData()
                formData.append('file', selectedImage)

                const uploadResponse = await fetch('/api/upload/chat-image', {
                    method: 'POST',
                    body: formData
                })

                if (uploadResponse.ok) {
                    const { url } = await uploadResponse.json()
                    imageUrl = url
                }
            }

            // Create message
            const messageData: any = {
                message: userMessageText,
                imageUrl: imageUrl,
                isAdmin: false
            }

            if (user) {
                messageData.userId = user.id
            } else if (guestSession) {
                messageData.guestSessionId = guestSession.id
            }

            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            })

            if (response.ok) {
                const savedMessage = await response.json()
                setMessages(prev => [...prev, savedMessage]) // Optimistic update
                fetchMessages() // Refresh to be sure
            }

            setNewMessage('')
            setSelectedImage(null)
            setImagePreview(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }

            // Trigger AI response if enabled and message has text
            if (aiEnabled && userMessageText && !imageUrl) {
                setAiTyping(true)
                try {
                    const aiResponse = await fetch('/api/ai-agent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: userMessageText,
                            userId: user?.id || null,
                            guestSessionId: guestSession?.id || null,
                            chatHistory: messages.slice(-5) // Last 5 messages for context
                        })
                    })

                    if (aiResponse.ok) {
                        // AI response will be fetched on next poll
                        setTimeout(() => fetchMessages(), 1000)
                    }
                } catch (aiError) {
                    console.error('AI agent error:', aiError)
                } finally {
                    setAiTyping(false)
                }
            }
        } catch (error) {
            console.error('Error sending message:', error)
        } finally {
            setUploading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Open chat"
            >
                <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-500 rounded-full animate-pulse opacity-75"></div>
                    {/* Main button */}
                    <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-emerald-600 to-cyan-600 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                        <MessageSquare className="h-7 w-7 text-white" />
                        {/* Online indicator */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-4 border-white rounded-full animate-bounce"></div>
                    </div>
                </div>
            </button>
        )
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col h-[650px] transition-all duration-500 ease-out animate-in slide-in-from-bottom-8 fade-in">
                {/* Header */}
                <div className="relative p-5 bg-gradient-to-br from-blue-600 via-emerald-600 to-cyan-600 rounded-t-3xl overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                    </div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {userProfile?.avatar_url ? (
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-3 border-white/40 shadow-lg ring-2 ring-white/20">
                                        <Image
                                            src={userProfile.avatar_url}
                                            alt={userProfile.display_name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
                                        <UserIcon className="h-6 w-6 text-white" />
                                    </div>
                                )}
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-white">Live Support</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="flex gap-0.5">
                                        <span className="w-1 h-1 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1 h-1 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1 h-1 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <p className="text-xs text-white/95 font-medium">Agent available</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setAiEnabled(!aiEnabled)}
                                className={`p-2 rounded-full transition-all duration-200 ${aiEnabled ? 'bg-white/25 shadow-lg' : 'hover:bg-white/15'}`}
                                title={aiEnabled ? 'AI Agent: ON' : 'AI Agent: OFF'}
                            >
                                <Sparkles className={`h-4 w-4 ${aiEnabled ? 'text-yellow-300' : 'text-white/90'}`} />
                            </button>
                            <button
                                onClick={() => {
                                    setShowOrdersView(!showOrdersView)
                                    setShowCatalogView(false)
                                    if (!showOrdersView) {
                                        fetchOrders()
                                    }
                                }}
                                className="p-2 rounded-full hover:bg-white/15 transition-all duration-200"
                                title="My Orders"
                            >
                                <ShoppingBag className="h-4 w-4 text-white/90" />
                            </button>
                            <button
                                onClick={() => {
                                    setShowCatalogView(!showCatalogView)
                                    setShowOrdersView(false)
                                }}
                                className="p-2 rounded-full hover:bg-white/15 transition-all duration-200"
                                title="Browse Services"
                            >
                                <BookOpen className="h-4 w-4 text-white/90" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-white/15 transition-all duration-200"
                            >
                                <X className="h-4 w-4 text-white/90" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Guest Form */}
                {!user && !guestSession && showGuestForm && (
                    <GuestChatForm
                        onSubmit={(session: GuestSession) => {
                            setGuestSession(session)
                            setShowGuestForm(false)
                        }}
                    />
                )}

                {/* Messages */}
                {(user || guestSession) && !showOrdersView && !showCatalogView && (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center">
                                        <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No messages yet</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500">Start a conversation with us!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.is_admin ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                        {msg.is_admin && (
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md ${msg.is_ai_response
                                                ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                }`}>
                                                {msg.is_ai_response ? (
                                                    <Bot className="h-5 w-5 text-white" />
                                                ) : adminAvatar ? (
                                                    <Image
                                                        src={adminAvatar}
                                                        alt="Admin"
                                                        width={36}
                                                        height={36}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="h-5 w-5 text-white" />
                                                )}
                                            </div>
                                        )}

                                        <div className={`max-w-[75%] ${msg.is_admin ? '' : 'flex flex-col items-end'}`}>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mb-2">
                                                    {msg.attachments.map((att, idx) => (
                                                        <div key={idx} className="rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100 dark:border-gray-700">
                                                            <Image
                                                                src={att.file_url}
                                                                alt="Uploaded image"
                                                                width={280}
                                                                height={280}
                                                                className="object-cover w-full max-w-[280px] h-auto transition-transform hover:scale-105 duration-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.message && msg.message !== '📷 Image' && (
                                                <div className="group relative">
                                                    <div
                                                        className={`rounded-3xl px-5 py-3 shadow-md transition-all duration-200 ${msg.is_admin
                                                            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-md'
                                                            : 'bg-gradient-to-br from-blue-600 via-emerald-600 to-cyan-600 text-white rounded-tr-md shadow-lg'
                                                            }`}
                                                    >
                                                        <p className="text-[15px] leading-relaxed font-normal">{msg.message}</p>
                                                        <p className={`text-[10px] mt-1.5 ${msg.is_admin ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {(!msg.message || msg.message === '📷 Image') && msg.attachments && msg.attachments.length > 0 && (
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>

                                        {!msg.is_admin && userProfile?.avatar_url && (
                                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-emerald-200 dark:ring-emerald-800">
                                                <Image
                                                    src={userProfile.avatar_url}
                                                    alt={userProfile.display_name}
                                                    width={36}
                                                    height={36}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {/* AI Typing Indicator */}
                            {aiTyping && (
                                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="max-w-[75%]">
                                        <div className="rounded-3xl rounded-tl-md px-5 py-3 bg-white dark:bg-gray-800 shadow-md">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="px-4 py-2 border-t border-border">
                                <div className="relative inline-block">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        width={100}
                                        height={100}
                                        className="rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedImage(null)
                                            setImagePreview(null)
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = ''
                                            }
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-3xl">
                            <div className="flex gap-2 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white dark:focus-within:bg-gray-700">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-110"
                                    title="Attach image"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-110"
                                    title="Payment inquiry"
                                >
                                    <DollarSign className="h-5 w-5" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 bg-transparent border-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-[15px]"
                                    disabled={uploading}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedImage) || uploading}
                                    className="p-3 bg-gradient-to-br from-blue-600 via-emerald-600 to-cyan-600 text-white rounded-full hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md"
                                >
                                    {uploading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Orders View */}
                {user && showOrdersView && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">My Orders</h3>
                            <button
                                onClick={() => setShowOrdersView(false)}
                                className="text-sm text-primary hover:underline"
                            >
                                Back to Chat
                            </button>
                        </div>

                        {orders.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No orders yet</p>
                                <p className="text-sm">Your orders will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-secondary border border-border rounded-lg p-4"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {order.item_title || order.item_type}
                                                </p>
                                                <p className="text-xs text-muted-foreground capitalize">
                                                    {order.item_type}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${order.status === 'paid'
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : order.status === 'pending'
                                                        ? 'bg-yellow-500/20 text-yellow-500'
                                                        : order.status === 'cancelled'
                                                            ? 'bg-red-500/20 text-red-500'
                                                            : 'bg-gray-500/20 text-gray-500'
                                                    }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-foreground font-semibold">
                                                रु {order.amount}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}



                {/* Catalog View */}
                {user && showCatalogView && (
                    <CatalogBrowse
                        onClose={() => setShowCatalogView(false)}
                        onPurchase={() => {
                            setShowCatalogView(false)
                            fetchOrders()
                        }}
                    />
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentInquiryModal
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={() => {
                        setShowPaymentModal(false)
                        fetchMessages()
                    }}
                />
            )}
        </>
    )
}

// Payment Inquiry Modal Component
function PaymentInquiryModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: () => void }) {
    const [inquiryType, setInquiryType] = useState('service')
    const [itemName, setItemName] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!itemName.trim()) return

        setSubmitting(true)

        try {
            const response = await fetch('/api/payment-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inquiryType,
                    itemName,
                    amount: amount ? parseFloat(amount) : null,
                    description
                })
            })

            if (response.ok) {
                // Call onSubmit to close modal and refresh messages
                onSubmit()
            } else {
                const error = await response.json()
                alert(`Error: ${error.error || 'Failed to submit inquiry'}`)
                setSubmitting(false)
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error)
            alert('Failed to submit inquiry. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        Usage Payment / Inquiry
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type
                        </label>
                        <select
                            value={inquiryType}
                            onChange={(e) => setInquiryType(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="service">Service Payment</option>
                            <option value="project">Project Milestone</option>
                            <option value="hosting">Hosting Renewal</option>
                            <option value="other">Other Inquiry</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Item Name / Reference
                        </label>
                        <input
                            type="text"
                            required
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="e.g. Web Development Phase 1"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount (रु) <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description / Message
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Any additional details..."
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        />
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Inquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
