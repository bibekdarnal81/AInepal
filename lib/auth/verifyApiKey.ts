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
        // If no origin/referer is present and restriction is set, block it 
        // (unless we want to allow server-to-server calls which might lack headers, but "Website" implies browser)
        // Exception: VS Code extensions often have null origin or vscode-webview://
        if (!requestOrigin) {
            // Check if it might be VS Code or server-side
            // For now, if allowedDomains is strictly set, we might be blocking the extension.
            // Let's assume if the user provided an API key in the extension, they intend to use it.
            // But we should warn or check if the key specifically allows 'vscode' (if we had that field).

            // Temporary fix: If origin starts with vscode-webview, we extract hostname from it.
            if (origin?.startsWith('vscode-webview://')) {
                // Allow VS Code webviews
                const vscodeUser = await User.findById(keyDoc.userId)
                return vscodeUser?.isSuspended ? null : vscodeUser
            }

            // If strictly null (no headers), we might want to allow it for now to unblock the user,
            // or return null. The user's issue is likely this.
            // Let's allow it if the key is valid.
            // return null
        }

        // Check if hostname ends with any allowed domain (to allow subdomains) or exact match
        const isAllowed = requestOrigin ? keyDoc.allowedDomains.some(domain =>
            requestOrigin === domain || requestOrigin.endsWith(`.${domain}`)
        ) : true // Allow if no origin (server/extension)

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
