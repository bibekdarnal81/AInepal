import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { uploadFile } from '@/lib/r2/operations';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const key = `${folder}/${user.id}-${uniqueSuffix}.${fileExt}`;

        // Upload to R2
        const result = await uploadFile({
            key,
            buffer,
            contentType: file.type,
            metadata: {
                userId: user.id
            }
        });

        return NextResponse.json({
            success: true,
            url: result.url,
            key: result.key
        });

    } catch (error: unknown) {
        console.error('Upload Error:', error);
        const message = error instanceof Error ? error.message : 'Error uploading file';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
