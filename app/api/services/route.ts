import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { Service } from '@/lib/mongodb/models';

export async function GET() {
    try {
        await dbConnect();

        const services = await Service.find({
            isPublished: true
        })
            .sort({ displayOrder: 1 })
            .limit(8)
            .lean();

        // Transform to match frontend interface
        const typedServices = services as Array<{
            _id: string
            title: string
            slug: string
            description?: string
            price?: number
            currency?: string
            iconName?: string
            category?: string
            features?: string[]
        }>
        const transformedServices = typedServices.map((s) => ({
            id: s._id.toString(),
            title: s.title,
            slug: s.slug,
            description: s.description,
            price: s.price,
            currency: s.currency,
            icon_name: s.iconName, // Map camelCase to snake_case
            category: s.category,
            features: s.features || []
        }));

        return NextResponse.json(transformedServices);

    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { error: 'Failed to fetch services' },
            { status: 500 }
        );
    }
}
