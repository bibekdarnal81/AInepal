/**
 * Type definitions for R2 object storage operations
 */

export interface UploadOptions {
  /** The file buffer to upload */
  buffer: Buffer;
  /** The key (path) where the file will be stored */
  key: string;
  /** Content type of the file (e.g., 'image/png') */
  contentType: string;
  /** Optional metadata to attach to the file */
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  /** The key (path) of the file in R2 */
  key: string;
  /** Public or presigned URL of the file */
  url: string;
  /** Size of the file in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: Date;
  /** Content type of the file */
  contentType?: string;
  /** ETag of the file */
  etag?: string;
}

export interface UploadResult {
  /** The key (path) where the file was stored */
  key: string;
  /** Public URL of the uploaded file (if available) */
  url: string;
  /** ETag of the uploaded file */
  etag?: string;
  /** Size of the uploaded file in bytes */
  size: number;
}

export interface DeleteResult {
  /** Whether the deletion was successful */
  success: boolean;
  /** The key that was deleted */
  key: string;
}

export interface ListFilesOptions {
  /** Prefix to filter files by */
  prefix?: string;
  /** Maximum number of files to return */
  maxKeys?: number;
  /** Continuation token for pagination */
  continuationToken?: string;
}

export interface ListFilesResult {
  /** Array of file metadata */
  files: FileMetadata[];
  /** Whether there are more files to fetch */
  isTruncated: boolean;
  /** Token to use for fetching next page */
  nextContinuationToken?: string;
}

export interface PresignedUrlOptions {
  /** The key of the file to generate URL for */
  key: string;
  /** Expiration time in seconds (default: 3600) */
  expiresIn?: number;
}
