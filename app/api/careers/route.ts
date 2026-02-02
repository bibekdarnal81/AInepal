import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { Career } from '@/lib/mongodb/models';

export async function GET() {
    try {
        await dbConnect();

        const careers = await Career.find({
            isPublished: true
        })
            .sort({ displayOrder: 1 })
            .limit(3)
            .lean();

        // Transform to match frontend interface
        const typedCareers = careers as unknown as Array<{
            _id: string
            title: string
            slug: string
            location?: string
            employmentType?: string
            department?: string
        }>
        const transformedCareers = typedCareers.map((c) => ({
            id: c._id.toString(),
            title: c.title,
            slug: c.slug,
            location: c.location,
            employment_type: c.employmentType, // Map camelCase to snake_case
            department: c.department
        }));

        return NextResponse.json(transformedCareers);

    } catch (error) {
        console.error('Error fetching careers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch careers' },
            { status: 500 }
        );
    }
}
