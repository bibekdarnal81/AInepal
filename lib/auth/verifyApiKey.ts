import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb/client'
import UserApiKey from '@/lib/mongodb/models/UserApiKey'
import User from '@/lib/mongodb/models/User'
import { IUserApiKey } from '@/lib/mongodb/models/UserApiKey'

export async function verifyApiKey(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')

    if (!apiKey) {
        return null
    }

    await dbConnect()

    const keyDoc = await UserApiKey.findOne({ key: apiKey }) as IUserApiKey | null

    if (!keyDoc) {
        console.log('VerifyApiKey: Key not found')
        return null
    }

    // Check expiration if set
    if (keyDoc.expiresAt && new Date() > keyDoc.expiresAt) {
        return null
    }

    // Check if key is active
    if (keyDoc.isActive === false) {
        return null
    }

    // Check allowed domains
    if (keyDoc.allowedDomains && keyDoc.allowedDomains.length > 0) {
        const origin = request.headers.get('origin')
        const referer = request.headers.get('referer')

        // Helper to extract hostname from url
        const getHostname = (url: string | null) => {
            if (!url) return null
            try {
                return new URL(url).hostname
            } catch {
                return null
            }
        }

        const requestOrigin = getHostname(origin) || getHostname(referer)

        // If no origin/referer is present and restriction is set, block it 
        // (unless we want to allow server-to-server calls which might lack headers, but "Website" implies browser)
        if (!requestOrigin) {
            return null
        }

        // Check if hostname ends with any allowed domain (to allow subdomains) or exact match
        const isAllowed = keyDoc.allowedDomains.some(domain =>
            requestOrigin === domain || requestOrigin.endsWith(`.${domain}`)
        )

        if (!isAllowed) {
            return null
        }
    }

    // Update last used asynchronously
    UserApiKey.findByIdAndUpdate(keyDoc._id, { lastUsedAt: new Date() }).exec()

    // Fetch associated user
    const user = await User.findById(keyDoc.userId)

    if (!user || user.isSuspended) {
        return null
    }

    return user
}
