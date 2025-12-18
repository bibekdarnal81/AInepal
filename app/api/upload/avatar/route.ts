import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Initialize R2 client with proper configuration for Cloudflare
const r2Client = new S3Client({
    region: 'us-east-1', // R2 requires a region but ignores it
    endpoint: process.env.R2_ENDPOINT || '',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true, // Required for R2
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'avatars'
const PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

export async function POST(request: NextRequest) {
    try {
        // Verify R2 credentials are configured
        const r2Endpoint = process.env.R2_ENDPOINT
        const r2AccessKey = process.env.R2_ACCESS_KEY_ID
        const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY
        const r2BucketName = process.env.R2_BUCKET_NAME
        const r2PublicUrl = process.env.R2_PUBLIC_URL

        // Log which credentials are missing (without exposing values)
        const missingCredentials = []
        if (!r2Endpoint) missingCredentials.push('R2_ENDPOINT')
        if (!r2AccessKey) missingCredentials.push('R2_ACCESS_KEY_ID')
        if (!r2SecretKey) missingCredentials.push('R2_SECRET_ACCESS_KEY')
        if (!r2BucketName) missingCredentials.push('R2_BUCKET_NAME')
        if (!r2PublicUrl) missingCredentials.push('R2_PUBLIC_URL')

        if (missingCredentials.length > 0) {
            console.error('Missing R2 credentials:', missingCredentials)
            return NextResponse.json({
                error: `R2 not configured. Missing: ${missingCredentials.join(', ')}`,
                details: 'Please check your .env.local file and restart the dev server'
            }, { status: 500 })
        }

        // Log credential info for debugging (without exposing sensitive data)
        console.log('R2 Configuration:', {
            endpoint: r2Endpoint,
            accessKeyId: r2AccessKey ? `${r2AccessKey.substring(0, 8)}...` : 'missing',
            bucketName: r2BucketName,
            publicUrl: r2PublicUrl
        })

        // Verify user is authenticated
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const userId = formData.get('userId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Verify userId matches authenticated user
        if (userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
        }

        // Create filename
        const fileExt = file.name.split('.').pop()
        const fileName = `uploads/avatars/${userId}-${Date.now()}.${fileExt}`

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
            CacheControl: 'max-age=31536000',
        })

        await r2Client.send(uploadCommand)

        // Construct public URL
        const publicUrl = `${PUBLIC_URL}/${fileName}`

        // Delete old avatar if exists
        const oldAvatarUrl = formData.get('oldAvatarUrl') as string
        if (oldAvatarUrl && oldAvatarUrl.includes(PUBLIC_URL)) {
            const oldKey = oldAvatarUrl.replace(`${PUBLIC_URL}/`, '')
            try {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: oldKey,
                })
                await r2Client.send(deleteCommand)
            } catch (err) {
                // Ignore deletion errors
                console.error('Error deleting old avatar:', err)
            }
        }

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Error uploading to R2:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Verify user is authenticated
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const avatarUrl = searchParams.get('url')

        if (!avatarUrl || !avatarUrl.includes(PUBLIC_URL)) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        // Extract key from URL
        const key = avatarUrl.replace(`${PUBLIC_URL}/`, '')

        // Verify it's the user's avatar
        if (!key.startsWith(`uploads/avatars/${user.id}`)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Delete from R2
        const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        })

        await r2Client.send(deleteCommand)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting from R2:', error)
        return NextResponse.json(
            { error: error.message || 'Delete failed' },
            { status: 500 }
        )
    }
}
