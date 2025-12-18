import { S3Client } from '@aws-sdk/client-s3';

/**
 * Configuration for R2 client
 */
interface R2Config {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl?: string;
}

/**
 * Get R2 configuration from environment variables
 */
function getR2Config(): R2Config {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
        throw new Error(
            'Missing required R2 configuration. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your environment variables.'
        );
    }

    return {
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicUrl,
    };
}

/**
 * Create and configure S3 client for R2
 * R2 is S3-compatible, so we use the AWS SDK S3 client
 */
let r2Client: S3Client | null = null;
let r2Config: R2Config | null = null;

export function getR2Client(): S3Client {
    if (!r2Client) {
        const config = getR2Config();
        r2Config = config;

        r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }

    return r2Client;
}

export function getR2BucketName(): string {
    if (!r2Config) {
        r2Config = getR2Config();
    }
    return r2Config.bucketName;
}

export function getR2PublicUrl(): string | undefined {
    if (!r2Config) {
        r2Config = getR2Config();
    }
    return r2Config.publicUrl;
}
