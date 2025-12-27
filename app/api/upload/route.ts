import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadFile } from '@/lib/r2/operations';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

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

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error uploading file' },
            { status: 500 }
        );
    }
}
