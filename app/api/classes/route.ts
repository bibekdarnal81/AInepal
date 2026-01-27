import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { Class } from '@/lib/mongodb/models';

export async function GET() {
    try {
        await dbConnect();

        const classes = await Class.find({
            isPublished: true
        })
            .sort({ isFeatured: -1, displayOrder: 1 }) // Sort by isFeatured desc, then displayOrder asc
            .limit(3)
            .lean();

        // Transform to match frontend interface
        const typedClasses = classes as Array<{
            _id: string
            title: string
            slug: string
            summary?: string
            level?: string
            duration?: string
            startDate?: string
            price?: number
            currency?: string
            thumbnailUrl?: string
            isFeatured?: boolean
        }>
        const transformedClasses = typedClasses.map((c) => ({
            id: c._id.toString(),
            title: c.title,
            slug: c.slug,
            summary: c.summary,
            level: c.level,
            duration: c.duration,
            start_date: c.startDate, // Map camelCase to snake_case
            price: c.price,
            currency: c.currency,
            thumbnail_url: c.thumbnailUrl,
            is_featured: c.isFeatured
        }));

        return NextResponse.json(transformedClasses);

    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classes' },
            { status: 500 }
        );
    }
}
