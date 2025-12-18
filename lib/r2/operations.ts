import {
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, getR2BucketName, getR2PublicUrl } from './client';
import type {
    UploadOptions,
    UploadResult,
    DeleteResult,
    ListFilesOptions,
    ListFilesResult,
    FileMetadata,
    PresignedUrlOptions,
} from './types';

/**
 * Upload a file to R2
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: options.key,
        Body: options.buffer,
        ContentType: options.contentType,
        Metadata: options.metadata,
    });

    const response = await client.send(command);

    // Generate URL for the uploaded file
    const url = await getFileUrl(options.key);

    return {
        key: options.key,
        url,
        etag: response.ETag,
        size: options.buffer.length,
    };
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<DeleteResult> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    await client.send(command);

    return {
        success: true,
        key,
    };
}

/**
 * Get a public or presigned URL for a file
 */
export async function getFileUrl(key: string, expiresIn?: number): Promise<string> {
    const publicUrl = getR2PublicUrl();

    // If public URL is configured, use it
    if (publicUrl) {
        return `${publicUrl}/${key}`;
    }

    // Otherwise, generate a presigned URL
    return getPresignedUrl({ key, expiresIn });
}

/**
 * Generate a presigned URL for temporary access to a file
 */
export async function getPresignedUrl(
    options: PresignedUrlOptions
): Promise<string> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: options.key,
    });

    const url = await getSignedUrl(client, command, {
        expiresIn: options.expiresIn || 3600, // Default 1 hour
    });

    return url;
}

/**
 * List files in R2 bucket
 */
export async function listFiles(
    options?: ListFilesOptions
): Promise<ListFilesResult> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: options?.prefix,
        MaxKeys: options?.maxKeys || 1000,
        ContinuationToken: options?.continuationToken,
    });

    const response = await client.send(command);

    const files: FileMetadata[] =
        response.Contents?.map((item) => ({
            key: item.Key!,
            size: item.Size || 0,
            lastModified: item.LastModified || new Date(),
            etag: item.ETag,
        })) || [];

    return {
        files,
        isTruncated: response.IsTruncated || false,
        nextContinuationToken: response.NextContinuationToken,
    };
}

/**
 * Get metadata for a specific file
 */
export async function getFileMetadata(key: string): Promise<FileMetadata> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    const response = await client.send(command);

    return {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        contentType: response.ContentType,
        etag: response.ETag,
    };
}

/**
 * Check if a file exists in R2
 */
export async function fileExists(key: string): Promise<boolean> {
    try {
        await getFileMetadata(key);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get a file's content from R2
 */
export async function getFile(key: string): Promise<Buffer> {
    const client = getR2Client();
    const bucket = getR2BucketName();

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    const response = await client.send(command);

    if (!response.Body) {
        throw new Error(`File not found: ${key}`);
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}
