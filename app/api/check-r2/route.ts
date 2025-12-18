import { NextResponse } from 'next/server'

export async function GET() {
    const config = {
        endpoint: process.env.R2_ENDPOINT || 'NOT SET',
        accessKeyId: process.env.R2_ACCESS_KEY_ID ? '✓ SET' : '✗ NOT SET',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ? '✓ SET' : '✗ NOT SET',
        bucketName: process.env.R2_BUCKET_NAME || 'NOT SET',
        publicUrl: process.env.R2_PUBLIC_URL || 'NOT SET',
    }

    const allSet =
        process.env.R2_ENDPOINT &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME &&
        process.env.R2_PUBLIC_URL

    return NextResponse.json({
        configured: !!allSet,
        config,
        message: allSet
            ? '✅ All R2 environment variables are configured!'
            : '⚠️ Missing R2 environment variables. Check R2_SETUP.md for instructions.'
    })
}
