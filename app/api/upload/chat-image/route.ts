import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/r2/operations'

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
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

        // If messageId provided, create attachment record
        if (messageId) {
            const { error: attachmentError } = await supabase
                .from('chat_attachments')
                .insert({
                    message_id: messageId,
                    file_url: uploadResult.url,
                    file_type: file.type,
                    file_size: file.size
                })

            if (attachmentError) {
                console.error('Error creating attachment record:', attachmentError)
            }
        }

        return NextResponse.json({
            url: uploadResult.url,
            fileName,
            fileType: file.type,
            fileSize: file.size
        })
    } catch (error: any) {
        console.error('Error uploading chat image:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}
