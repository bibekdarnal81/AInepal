import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { Service } from '@/lib/mongodb/models';
import mongoose from 'mongoose';

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
        const typedServices = services as unknown as Array<{
            _id: mongoose.Types.ObjectId
            title: string
            slug: string
            description?: string
            price?: number
            currency?: string
            iconName?: string
            category?: string
            features?: string[]
            thumbnailUrl?: string
        }>
        const transformedServices = typedServices.map((s) => ({
            id: s._id.toString(),
            title: s.title,
            slug: s.slug,
            description: s.description,
            price: s.price,
            currency: s.currency,
            icon_name: s.iconName,
            image_url: s.thumbnailUrl,
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
