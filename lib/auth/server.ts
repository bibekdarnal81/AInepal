import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * Get the current session on the server side
 */
export async function getSession() {
    return await getServerSession(authOptions)
}

/**
 * Get the current user from the session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
    const session = await getSession()
    return session?.user ?? null
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated() {
    const session = await getSession()
    return !!session?.user
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
    const session = await getSession()
    return session?.user?.isAdmin ?? false
}

/**
 * Require authentication - throws if not authenticated
 * Use in API routes for protection
 */
export async function requireAuth() {
    const session = await getSession()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }
    return session.user
}

/**
 * Require admin - throws if not admin
 * Use in API routes for admin protection
 */
export async function requireAdmin() {
    const user = await requireAuth()
    if (!user.isAdmin) {
        throw new Error('Forbidden: Admin access required')
    }
    return user
}
