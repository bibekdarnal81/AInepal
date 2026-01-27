import { NextRequest, NextResponse } from 'next/server';
import { listFiles, deleteFile, deleteFiles, getFileMetadata } from '@/lib/r2/operations';

/**
 * GET /api/files
 * List files in R2 bucket
 * 
 * Query parameters:
 * - prefix: Filter files by prefix
 * - maxKeys: Maximum number of files to return
 * - continuationToken: Token for pagination
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const prefix = searchParams.get('prefix') || undefined;
        const maxKeys = searchParams.get('maxKeys')
            ? parseInt(searchParams.get('maxKeys')!)
            : undefined;
        const continuationToken = searchParams.get('continuationToken') || undefined;

        const result = await listFiles({
            prefix,
            maxKeys,
            continuationToken,
        });

        return NextResponse.json({
            success: true,
            files: result.files,
            isTruncated: result.isTruncated,
            nextContinuationToken: result.nextContinuationToken,
        });
    } catch (error) {
        console.error('List files error:', error);
        return NextResponse.json(
            { error: 'Failed to list files', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/files
 * Delete a file from R2
 * 
 * Body:
 * - key: The key of the file to delete
 */
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, keys } = body;

        if (!key && (!keys || !Array.isArray(keys) || keys.length === 0)) {
            return NextResponse.json(
                { error: 'No file key or keys provided' },
                { status: 400 }
            );
        }

        if (keys && Array.isArray(keys)) {
            const results = await deleteFiles(keys);
            const allSuccess = results.every(r => r.success);
            return NextResponse.json({
                success: allSuccess,
                results
            });
        }

        // Verify file exists before deleting
        try {
            await getFileMetadata(key);
        } catch (error) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        const result = await deleteFile(key);

        return NextResponse.json({
            success: result.success,
            key: result.key,
        });
    } catch (error) {
        console.error('Delete file error:', error);
        return NextResponse.json(
            { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
