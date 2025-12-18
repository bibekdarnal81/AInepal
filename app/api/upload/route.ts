import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2/operations';

/**
 * Maximum file size in bytes (10MB)
 * Adjust this based on your needs
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed file types
 * Adjust this based on your needs
 */
const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
];

/**
 * POST /api/upload
 * Upload a file to R2
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `File type ${file.type} is not allowed` },
                { status: 400 }
            );
        }

        // Generate a unique key for the file
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `uploads/${timestamp}-${sanitizedName}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to R2
        const result = await uploadFile({
            buffer,
            key,
            contentType: file.type,
            metadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString(),
            },
        });

        return NextResponse.json({
            success: true,
            file: {
                key: result.key,
                url: result.url,
                size: result.size,
                contentType: file.type,
                originalName: file.name,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
