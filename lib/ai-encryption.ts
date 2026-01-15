import crypto from 'crypto'

// Get encryption key from environment variable
const ENCRYPTION_KEY = process.env.AI_API_KEY_ENCRYPTION_SECRET || 'default-dev-key-change-in-production-32bytes!!'

// Ensure key is exactly 32 bytes for AES-256
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)

/**
 * Encrypts an API key using AES-256-CBC
 * @param apiKey - The API key to encrypt
 * @returns Object containing encrypted key and initialization vector
 */
export function encryptApiKey(apiKey: string): { encryptedKey: string; iv: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv)

    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
        encryptedKey: encrypted,
        iv: iv.toString('hex')
    }
}

/**
 * Decrypts an encrypted API key
 * @param encryptedKey - The encrypted API key
 * @param ivHex - The initialization vector in hex format
 * @returns The decrypted API key
 */
export function decryptApiKey(encryptedKey: string, ivHex: string): string {
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv)

    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}

/**
 * Masks an API key for display purposes (shows only first and last 4 characters)
 * @param apiKey - The API key to mask
 * @returns Masked API key string
 */
export function maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) {
        return '****'
    }
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
}
