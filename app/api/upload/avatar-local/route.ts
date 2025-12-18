import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Create filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const filePath = join(uploadsDir, fileName)

        // Convert file to buffer and save
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        await writeFile(filePath, buffer)

        // Construct public URL
        const publicUrl = `/uploads/avatars/${fileName}`

        // Delete old avatar if exists
        const oldAvatarUrl = formData.get('oldAvatarUrl') as string
        if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/avatars/')) {
            const oldFileName = oldAvatarUrl.split('/').pop()
            if (oldFileName) {
                const oldFilePath = join(uploadsDir, oldFileName)
                try {
                    if (existsSync(oldFilePath)) {
                        await unlink(oldFilePath)
                    }
                } catch (err) {
                    console.error('Error deleting old avatar:', err)
                }
            }
        }

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Error uploading file:', error)
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

        if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        // Extract filename
        const fileName = avatarUrl.split('/').pop()
        if (!fileName) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        // Verify it's the user's avatar
        if (!fileName.startsWith(user.id)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Delete file
        const filePath = join(process.cwd(), 'public', 'uploads', 'avatars', fileName)
        if (existsSync(filePath)) {
            await unlink(filePath)
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting file:', error)
        return NextResponse.json(
            { error: error.message || 'Delete failed' },
            { status: 500 }
        )
    }
}
