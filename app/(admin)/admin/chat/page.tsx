'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Loader2, MessageCircle, Send, User, Trash2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface Message { id: string; message: string; isAdmin: boolean; isRead: boolean; imageUrl?: string; createdAt: string }
interface LastMessage { message: string }
interface Conversation { id: string; type: 'user' | 'guest'; name: string; email?: string; avatarUrl?: string; unreadCount: number; lastMessage?: LastMessage; messages: Message[]; createdAt: string }

export default function AdminChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()
    const targetUserId = searchParams.get('userId')

    const selected = conversations.find(c => c.id === selectedId)

    const fetchData = async () => {
        try {
            const url = targetUserId ? `/api/admin/chat?userId=${targetUserId}` : '/api/admin/chat'
            const res = await fetch(url)
            const data = await res.json() as { conversations: Conversation[] }
            if (res.ok) {
                setConversations(data.conversations)
                if (targetUserId && !selectedId) {
                    const targetConv = data.conversations.find((c: Conversation) => c.id === targetUserId)
                    if (targetConv) setSelectedId(targetConv.id)
                }
            }
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData(); const i = setInterval(fetchData, 10000); return () => clearInterval(i) }, [])
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages])

    const markAsRead = async (id: string, type: string) => {
        try { await fetch('/api/admin/chat', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, type }) }) }
        catch (e) { console.error(e) }
    }

    const handleSelect = (conv: Conversation) => {
        setSelectedId(conv.id)
        if (conv.unreadCount > 0) markAsRead(conv.id, conv.type)
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selected) return
        setSending(true)
        try {
            const res = await fetch('/api/admin/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, type: selected.type, message: newMessage }) })
            if (res.ok) { setNewMessage(''); fetchData() }
        } catch (e) { console.error(e) }
        finally { setSending(false) }
    }

    const handleDelete = async (e: React.MouseEvent, id: string, type: string) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/admin/chat?id=${id}&type=${type}`, { method: 'DELETE' })
            if (res.ok) {
                if (selectedId === id) setSelectedId(null)
                fetchData()
            }
        } catch (e) { console.error(e) }
        finally { setDeletingId(null) }
    }

    const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            <div className="mb-6"><h1 className="text-3xl font-bold">Chat</h1><p className="text-muted-foreground mt-1">Manage guest conversations {totalUnread > 0 && <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">{totalUnread} unread</span>}</p></div>

            {loading ? <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
                <div className="flex-1 flex gap-4 min-h-0">
                    {/* Conversations List */}
                    <div className="w-80 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border font-medium">Conversations</div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground"><MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No conversations</p></div>
                            ) : conversations.map(conv => (
                                <div key={conv.id} onClick={() => handleSelect(conv)} className={`p-4 cursor-pointer border-b border-border hover:bg-secondary/30 transition-colors relative group/conv ${selectedId === conv.id ? 'bg-primary/10' : ''}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ${conv.type === 'user' ? 'bg-blue-500/10' : 'bg-secondary'}`}>
                                                {conv.avatarUrl ? <img src={conv.avatarUrl} className="w-full h-full object-cover" /> : <User className={`h-4 w-4 ${conv.type === 'user' ? 'text-blue-500' : ''}`} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm leading-none mb-1">{conv.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{conv.type}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {conv.unreadCount > 0 && <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
                                            <button
                                                onClick={(e) => handleDelete(e, conv.id, conv.type)}
                                                disabled={deletingId === conv.id}
                                                className="p-1.5 opacity-0 group-hover/conv:opacity-100 hover:bg-red-500/10 rounded-lg text-red-500 transition-all"
                                            >
                                                {deletingId === conv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                    {conv.lastMessage && <p className="text-xs text-muted-foreground truncate ml-10">{conv.lastMessage.message}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                        {selected ? (
                            <>
                                <div className="p-4 border-b border-border flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${selected.type === 'user' ? 'bg-blue-500/10' : 'bg-secondary'}`}>
                                        {selected.avatarUrl ? <img src={selected.avatarUrl} className="w-full h-full object-cover" /> : <User className={`h-5 w-5 ${selected.type === 'user' ? 'text-blue-500' : ''}`} />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{selected.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{selected.type === 'user' ? 'Registered User' : 'Guest visitor'}</p>
                                        {selected.email && <p className="text-[10px] text-muted-foreground">{selected.email}</p>}
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {selected.messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] px-4 py-2 rounded-xl ${msg.isAdmin ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                                <p>{msg.message}</p>
                                                {msg.imageUrl && <img src={msg.imageUrl} alt="" className="mt-2 max-w-full rounded" />}
                                                <p className={`text-xs mt-1 ${msg.isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{new Date(msg.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t border-border flex gap-2">
                                    <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                    <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">{sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}</button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center"><div><MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" /><h3 className="text-lg font-medium mb-2">Select a conversation</h3><p className="text-muted-foreground">Click on a conversation to view messages</p></div></div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
