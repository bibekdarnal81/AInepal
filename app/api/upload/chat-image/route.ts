import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { uploadFile } from '@/lib/r2/operations'

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const session = await getServerSession(authOptions)
        const user = session?.user

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const messageId = formData.get('messageId') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type (images only)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
        }

        // Validate file size (5MB max for chat images)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
        }

        // Create filename for R2
        const fileExt = file.name.split('.').pop()
        const fileName = `chat-images/${user.id}/${Date.now()}.${fileExt}`

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to R2
        const uploadResult = await uploadFile({
            key: fileName,
            buffer,
            contentType: file.type,
            metadata: {
                userId: user.id,
                messageId: messageId || '',
                originalName: file.name
            }
        })

        // Note: Legacy chat_attachments insert removed as we are migrating to MongoDB
        // and using direct image URL in ChatMessage model if needed.



        return NextResponse.json({
            url: uploadResult.url,
            fileName,
            fileType: file.type,
            fileSize: file.size
        })
    } catch (error: unknown) {
        console.error('Error uploading chat image:', error)
        const message = error instanceof Error ? error.message : 'Upload failed'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
