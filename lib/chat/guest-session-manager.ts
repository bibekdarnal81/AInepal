import { createClient } from '@/lib/supabase/client'

export interface GuestSession {
    id: string
    guest_name: string
    guest_email: string
    guest_phone?: string
    initial_question?: string
    session_token: string
    created_at: string
}

interface CreateGuestSessionData {
    name: string
    email: string
    phone?: string
    question?: string
}

const STORAGE_KEY = 'guest_chat_session'

/**
 * Create a new guest chat session
 */
export async function createGuestSession(data: CreateGuestSessionData): Promise<GuestSession | null> {
    try {
        const response = await fetch('/api/chat/guest-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Failed to create guest session:', error)
            console.error('Response status:', response.status)
            console.error('Full error details:', JSON.stringify(error, null, 2))
            return null
        }

        const session = await response.json()
        saveGuestSessionToStorage(session)
        return session
    } catch (error) {
        console.error('Error creating guest session:', error)
        return null
    }
}

/**
 * Get guest session from localStorage
 */
export function getGuestSessionFromStorage(): GuestSession | null {
    if (typeof window === 'undefined') return null

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return null
        return JSON.parse(stored)
    } catch (error) {
        console.error('Error reading guest session from storage:', error)
        return null
    }
}

/**
 * Save guest session to localStorage
 */
export function saveGuestSessionToStorage(session: GuestSession): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch (error) {
        console.error('Error saving guest session to storage:', error)
    }
}

/**
 * Clear guest session from localStorage
 */
export function clearGuestSession(): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Error clearing guest session:', error)
    }
}

/**
 * Check if current session is a guest session
 */
export function isGuestSession(): boolean {
    return getGuestSessionFromStorage() !== null
}

/**
 * Get session identifier (user_id or guest_session_id)
 */
export async function getSessionIdentifier(): Promise<{ userId?: string; guestSessionId?: string }> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return { userId: user.id }
    }

    const guestSession = getGuestSessionFromStorage()
    if (guestSession) {
        return { guestSessionId: guestSession.id }
    }

    return {}
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone format (basic validation for international formats)
 */
export function isValidPhone(phone: string): boolean {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')
    // Check if it has at least 10 digits (reasonable minimum for most countries)
    return digitsOnly.length >= 10
}
