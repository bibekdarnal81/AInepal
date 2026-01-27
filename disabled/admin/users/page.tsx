'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, UserCircle, Search, Filter } from 'lucide-react'

interface RegisteredUser {
    id: string
    display_name: string
    email: string
    avatar_url: string | null
    is_admin: boolean
    created_at: string
}

interface GuestUser {
    id: string
    guest_name: string
    guest_email: string
    guest_phone: string | null
    initial_question: string | null
    created_at: string
}

export default function UsersPage() {
    const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
    const [guestUsers, setGuestUsers] = useState<GuestUser[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'registered' | 'guest'>('registered')
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)

        // Fetch registered users
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('id, display_name, email, avatar_url, is_admin, created_at')
            .order('created_at', { ascending: false })

        if (usersError) {
            console.error('❌ Error fetching registered users:', usersError)
        } else if (users) {
            console.log('✅ Fetched', users.length, 'registered users')
            setRegisteredUsers(users)
        }

        // Fetch guest users
        const { data: guests, error: guestsError } = await supabase
            .from('guest_chat_sessions')
            .select('*')
            .order('created_at', { ascending: false })

        if (guestsError) {
            console.error('❌ Error fetching guest users:', guestsError)
        } else if (guests) {
            console.log('✅ Fetched', guests.length, 'guest users')
            setGuestUsers(guests)
        }

        setLoading(false)
    }

    // Filter users based on search query
    const filteredRegisteredUsers = registeredUsers.filter(user =>
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const filteredGuestUsers = guestUsers.filter(guest =>
        guest.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guest.guest_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guest.guest_phone && guest.guest_phone.includes(searchQuery))
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
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Users</h1>
                <p className="text-muted-foreground mt-1">Manage registered and guest users</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-violet-500/10 text-violet-500">
                            <UserCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Registered Users</p>
                            <p className="text-2xl font-bold text-foreground">{registeredUsers.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Guest Users</p>
                            <p className="text-2xl font-bold text-foreground">{guestUsers.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search users by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-xl border border-border">
                <div className="border-b border-border">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('registered')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'registered'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <UserCircle className="h-5 w-5" />
                            Registered Users ({filteredRegisteredUsers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('guest')}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'guest'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Users className="h-5 w-5" />
                            Guest Users ({filteredGuestUsers.length})
                        </button>
                    </div>
                </div>

                {/* User List */}
                <div className="divide-y divide-border">
                    {activeTab === 'registered' ? (
                        filteredRegisteredUsers.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No users found matching your search' : 'No registered users yet'}
                                </p>
                            </div>
                        ) : (
                            filteredRegisteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.display_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle className="h-7 w-7 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{user.display_name}</h3>
                                            {user.is_admin && (
                                                <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1.5 text-xs bg-violet-500/10 text-violet-500 rounded-full font-medium">
                                            Registered
                                        </span>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        filteredGuestUsers.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? 'No users found matching your search' : 'No guest users yet'}
                                </p>
                            </div>
                        ) : (
                            filteredGuestUsers.map((guest) => (
                                <div
                                    key={guest.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                                        <Users className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{guest.guest_name}</h3>
                                            <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                                                Guest
                                            </span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm text-muted-foreground">📧 {guest.guest_email}</p>
                                            {guest.guest_phone && (
                                                <p className="text-sm text-muted-foreground">📱 {guest.guest_phone}</p>
                                            )}
                                            {guest.initial_question && (
                                                <p className="text-xs text-muted-foreground italic mt-2">
                                                    "{guest.initial_question.substring(0, 100)}
                                                    {guest.initial_question.length > 100 ? '...' : ''}"
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Started chat {new Date(guest.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
