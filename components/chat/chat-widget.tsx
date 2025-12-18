'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, X, Send, Paperclip, DollarSign, User as UserIcon, ShoppingBag, BookOpen, Bot, Sparkles } from 'lucide-react'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'

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
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [user, setUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [guestName, setGuestName] = useState('')
    const [showNameInput, setShowNameInput] = useState(true)
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
    const supabase = createClient()

    useEffect(() => {
        checkUser()
    }, [])

    useEffect(() => {
        if (user && isOpen) {
            fetchUserProfile()
            fetchAdminProfile()
            fetchMessages()
            subscribeToMessages()
        }
    }, [user, isOpen])

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

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
            setShowNameInput(false)
        }
    }

    const fetchUserProfile = async () => {
        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', user.id)
            .single()

        if (data) {
            setUserProfile(data)
        }
    }

    const fetchAdminProfile = async () => {
        if (!user) return

        // Get admin avatar from the first admin message's sender
        const { data: adminMessages } = await supabase
            .from('chat_messages')
            .select('user_id')
            .eq('user_id', user.id)
            .eq('is_admin', true)
            .limit(1)

        if (adminMessages && adminMessages.length > 0) {
            // If there are admin messages, try to get admin's avatar
            // For now, we'll use a default approach - you can customize this
            // to fetch the specific admin user's profile
            const { data: profiles } = await supabase
                .from('profiles')
                .select('avatar_url')
                .neq('id', user.id)
                .limit(1)
                .single()

            if (profiles?.avatar_url) {
                setAdminAvatar(profiles.avatar_url)
            }
        }
    }

    const fetchOrders = async () => {
        if (!user) return

        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) {
            setOrders(data)
        }
    }



    const fetchMessages = async () => {
        if (!user) return

        const { data: messagesData } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })

        if (messagesData) {
            // Fetch attachments for all messages
            const messageIds = messagesData.map(m => m.id)
            const { data: attachmentsData } = await supabase
                .from('chat_attachments')
                .select('*')
                .in('message_id', messageIds)

            // Combine messages with their attachments
            const messagesWithAttachments = messagesData.map(msg => ({
                ...msg,
                attachments: attachmentsData?.filter(att => att.message_id === msg.id) || []
            }))

            setMessages(messagesWithAttachments)
        }
    }

    const subscribeToMessages = () => {
        if (!user) return

        const channel = supabase
            .channel('chat_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as ChatMessage])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleGuestStart = async () => {
        if (!guestName.trim()) return

        const returnUrl = encodeURIComponent(window.location.pathname)
        window.location.href = `/auth/register?return=${returnUrl}&name=${encodeURIComponent(guestName)}`
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
        if ((!newMessage.trim() && !selectedImage) || !user) return

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
            const messageText = userMessageText || '📷 Image'
            const { data: messageData, error } = await supabase
                .from('chat_messages')
                .insert({
                    user_id: user.id,
                    message: messageText,
                    is_admin: false,
                    is_read: false
                })
                .select()
                .single()

            if (!error && messageData && imageUrl) {
                // Create attachment record
                await supabase
                    .from('chat_attachments')
                    .insert({
                        message_id: messageData.id,
                        file_url: imageUrl,
                        file_type: selectedImage?.type || 'image/jpeg',
                        file_size: selectedImage?.size || 0
                    })

                // Refresh messages to show the image
                fetchMessages()
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
                            userId: user.id,
                            chatHistory: messages.slice(-5) // Last 5 messages for context
                        })
                    })

                    if (aiResponse.ok) {
                        // AI response is saved to DB by the API, will appear via subscription
                        await new Promise(resolve => setTimeout(resolve, 1000)) // Brief delay for natural feel
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
                className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
                aria-label="Open chat"
            >
                <MessageSquare className="h-6 w-6" />
            </button>
        )
    }

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-card border border-border rounded-xl shadow-2xl flex flex-col h-[600px]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-t-xl">
                    <div className="flex items-center gap-3">
                        {userProfile?.avatar_url ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                                <Image
                                    src={userProfile.avatar_url}
                                    alt={userProfile.display_name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <UserIcon className="h-5 w-5" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold">Chat Support</h3>
                            {userProfile && (
                                <p className="text-xs text-white/80">{userProfile.display_name}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setAiEnabled(!aiEnabled)}
                            className={`hover:bg-white/20 rounded p-1 ${aiEnabled ? 'bg-white/30' : ''}`}
                            title={aiEnabled ? 'AI Agent: ON' : 'AI Agent: OFF'}
                        >
                            <Sparkles className={`h-5 w-5 ${aiEnabled ? 'text-yellow-300' : 'text-white/60'}`} />
                        </button>
                        <button
                            onClick={() => {
                                setShowOrdersView(!showOrdersView)
                                setShowCatalogView(false)
                                if (!showOrdersView) {
                                    fetchOrders()
                                }
                            }}
                            className="hover:bg-white/20 rounded p-1"
                            title="My Orders"
                        >
                            <ShoppingBag className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => {
                                setShowCatalogView(!showCatalogView)
                                setShowOrdersView(false)
                            }}
                            className="hover:bg-white/20 rounded p-1"
                            title="Browse Services"
                        >
                            <BookOpen className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 rounded p-1"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Guest Name Input */}
                {!user && showNameInput && (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="w-full space-y-4">
                            <p className="text-foreground text-center mb-4">
                                Please enter your name to start chatting
                            </p>
                            <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Your name"
                                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                onKeyDown={(e) => e.key === 'Enter' && handleGuestStart()}
                            />
                            <button
                                onClick={handleGuestStart}
                                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                            >
                                Start Chat
                            </button>
                            <p className="text-xs text-muted-foreground text-center">
                                Already have an account?{' '}
                                <a href="/auth/login" className="text-primary hover:underline">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {user && !showOrdersView && !showCatalogView && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No messages yet</p>
                                    <p className="text-sm">Start a conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-2 ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        {msg.is_admin && (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.is_ai_response
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                }`}>
                                                {msg.is_ai_response ? (
                                                    <Bot className="h-4 w-4 text-white" />
                                                ) : adminAvatar ? (
                                                    <Image
                                                        src={adminAvatar}
                                                        alt="Admin"
                                                        width={32}
                                                        height={32}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="h-4 w-4 text-white" />
                                                )}
                                            </div>
                                        )}

                                        <div className={`max-w-[80%] ${msg.is_admin ? '' : 'flex flex-col items-end'}`}>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mb-2">
                                                    {msg.attachments.map((att, idx) => (
                                                        <div key={idx} className="rounded-2xl overflow-hidden bg-secondary/50">
                                                            <Image
                                                                src={att.file_url}
                                                                alt="Uploaded image"
                                                                width={280}
                                                                height={280}
                                                                className="object-cover w-full max-w-[280px] h-auto"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.message && msg.message !== '📷 Image' && (
                                                <div
                                                    className={`rounded-lg px-4 py-2 ${msg.is_admin
                                                        ? 'bg-secondary text-foreground'
                                                        : 'bg-gradient-to-r from-violet-600 to-pink-600 text-white'
                                                        }`}
                                                >
                                                    <p className="text-sm text-inherit">{msg.message}</p>
                                                    <p className="text-xs text-inherit opacity-70 mt-1">
                                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                            {(!msg.message || msg.message === '📷 Image') && msg.attachments && msg.attachments.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            )}
                                        </div>

                                        {!msg.is_admin && userProfile?.avatar_url && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={userProfile.avatar_url}
                                                    alt={userProfile.display_name}
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {/* AI Typing Indicator */}
                            {aiTyping && (
                                <div className="flex gap-2 justify-start">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="max-w-[80%]">
                                        <div className="rounded-lg px-4 py-2 bg-secondary text-foreground">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                            <div className="flex gap-2">
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
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    title="Attach image"
                                >
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                    title="Payment inquiry"
                                >
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                </button>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={uploading}
                                />
                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !selectedImage) || uploading}
                                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                NPR {order.amount}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={onClose}>
            <div className="bg-card border border-border rounded-xl p-6 w-96 max-w-[calc(100vw-3rem)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Payment Inquiry</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Type
                        </label>
                        <select
                            value={inquiryType}
                            onChange={(e) => setInquiryType(e.target.value)}
                            className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="service">Service</option>
                            <option value="course">Course</option>
                            <option value="project">Project</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="e.g., Web Development, React Course, Custom App"
                            className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Budget (optional)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us more about your requirements..."
                            rows={3}
                            className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !itemName.trim()}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Inquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Catalog Browse Component
function CatalogBrowse({ onClose, onPurchase }: { onClose: () => void, onPurchase: () => void }) {
    const [category, setCategory] = useState<'services' | 'courses' | 'projects'>('services')
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [category])

    const fetchItems = async () => {
        setLoading(true)
        const { data } = await supabase
            .from(category)
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) {
            setItems(data)
        }
        setLoading(false)
    }

    const handleBuyNow = async (item: any) => {
        setPurchasing(item.id)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please login to purchase')
                setPurchasing(null)
                return
            }

            // Create order
            const { error } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    item_type: category === 'services' ? 'service' : category === 'courses' ? 'course' : 'project',
                    item_id: item.id,
                    item_title: item.title,
                    item_slug: item.slug,
                    amount: item.price || 0,
                    currency: 'NPR',
                    status: 'pending'
                })

            if (error) {
                console.error('Error creating order:', error)
                alert('Failed to create order. Please try again.')
            } else {
                alert(`✅ Order created! ${item.title} - NPR ${item.price}\nCheck "My Orders" to view.`)
                onPurchase()
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to create order.')
        } finally {
            setPurchasing(null)
        }
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Browse & Buy</h3>
                <button
                    onClick={onClose}
                    className="text-sm text-primary hover:underline"
                >
                    Back to Chat
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
                {(['services', 'courses', 'projects'] as const).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${category === cat
                            ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {/* Items List */}
            {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="mt-2">Loading...</p>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No {category} available</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-secondary border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {item.thumbnail_url && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                        <Image
                                            src={item.thumbnail_url}
                                            alt={item.title}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground mb-1">
                                        {item.title}
                                    </h4>
                                    {item.description && (
                                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-lg font-bold text-foreground">
                                            NPR {item.price || 0}
                                        </span>
                                        <button
                                            onClick={() => handleBuyNow(item)}
                                            disabled={purchasing === item.id}
                                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {purchasing === item.id ? 'Processing...' : 'Buy Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
