'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, X, Send, Paperclip, DollarSign, User as UserIcon, ShoppingBag, BookOpen, Bot, Sparkles } from 'lucide-react'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { createGuestSession, getGuestSessionFromStorage, isValidEmail, isValidPhone, type GuestSession } from '@/lib/chat/guest-session-manager'

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
    const supabase = createClient()

    useEffect(() => {
        const init = async () => {
            const currentUser = await checkUser()
            checkGuestSession(currentUser)
        }
        init()
    }, [])

    useEffect(() => {
        if ((user || guestSession) && isOpen) {
            if (user) {
                fetchUserProfile()
                fetchAdminProfile()
            }
            fetchMessages()
            subscribeToMessages()
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

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        return user
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
        if (!user && !guestSession) return

        const query = supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true })

        if (user) {
            query.eq('user_id', user.id)
        } else if (guestSession) {
            query.eq('guest_session_id', guestSession.id)
        }

        const { data: messagesData } = await query

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
        if (!user && !guestSession) return

        const filter = user
            ? `user_id=eq.${user.id}`
            : `guest_session_id=eq.${guestSession!.id}`

        const channel = supabase
            .channel('chat_messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as ChatMessage])
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'chat_messages',
                filter
            }, (payload) => {
                setMessages(prev => prev.map(msg =>
                    msg.id === payload.new.id ? payload.new as ChatMessage : msg
                ))
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
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
            const messageText = userMessageText || '📷 Image'
            const messageData: any = {
                message: messageText,
                is_admin: false,
                is_read: false
            }

            if (user) {
                messageData.user_id = user.id
            } else if (guestSession) {
                messageData.guest_session_id = guestSession.id
            }

            const { data: newMessageData, error } = await supabase
                .from('chat_messages')
                .insert(messageData)
                .select()
                .single()

            if (!error && newMessageData && imageUrl) {
                // Create attachment record
                await supabase
                    .from('chat_attachments')
                    .insert({
                        message_id: newMessageData.id,
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
                            userId: user?.id || null,
                            guestSessionId: guestSession?.id || null,
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
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Open chat"
            >
                <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse opacity-75"></div>
                    {/* Main button */}
                    <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]">
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
                <div className="relative p-5 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-t-3xl overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
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
                                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
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
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
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
                                                            : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-tr-md shadow-lg'
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
                                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-purple-200 dark:ring-purple-800">
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
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
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
                            <div className="flex gap-2 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-all duration-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white dark:focus-within:bg-gray-700">
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
                                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110"
                                    title="Attach image"
                                >
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(true)}
                                    className="p-2.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:scale-110"
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
                                    className="p-3 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 shadow-md"
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

// Guest Chat Form Component
function GuestChatForm({ onSubmit }: { onSubmit: (session: GuestSession) => void }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        question: ''
    })
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateForm = (): boolean => {
        const newErrors = {
            name: '',
            email: '',
            phone: ''
        }
        let isValid = true

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'This field is required'
            isValid = false
        }

        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'This field is required'
            isValid = false
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Invalid email format'
            isValid = false
        }

        // Validate phone (optional but validate format if provided)
        if (formData.phone.trim() && !isValidPhone(formData.phone)) {
            newErrors.phone = 'Invalid phone format'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)

        try {
            const session = await createGuestSession({
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                question: formData.question || undefined
            })

            if (session) {
                onSubmit(session)
            } else {
                alert('Failed to start chat. Please try again.')
            }
        } catch (error) {
            console.error('Error starting guest chat:', error)
            alert('Failed to start chat. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-orange-500 to-orange-600">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="mb-6">


                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange('name')}
                            placeholder="* Name"
                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange('email')}
                            placeholder="* Email"
                            className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <div className="flex gap-2">
                            <div className="w-24 flex items-center gap-2 px-3 py-3 bg-white border-2 border-gray-300 rounded-xl">
                                <span className="text-2xl">🇳🇵</span>
                                <span className="text-sm">▼</span>
                            </div>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange('phone')}
                                placeholder="* Phone"
                                className={`flex-1 px-4 py-3 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    {/* Question Field */}
                    <div>
                        <textarea
                            value={formData.question}
                            onChange={handleInputChange('question')}
                            placeholder="* Question"
                            rows={4}
                            className="w-full px-4 py-3 bg-white border-2 border-blue-400 rounded-xl text-gray-900 placeholder-orange-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                Starting Chat...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Start Chat
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
