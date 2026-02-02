import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { BundleOffer } from '@/lib/mongodb/models';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const showOnHome = searchParams.get('showOnHome') === 'true';

        const query: Record<string, unknown> = { isActive: true };

        if (showOnHome) {
            query.showOnHome = true;
        }

        const offers = await BundleOffer.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Transform to match frontend expectations
        const typedOffers = offers as unknown as Array<{
            _id: string
            name: string
            description?: string
            price: number
            discountPercent?: number
            posterUrl?: string
            hostingType?: string
        }>
        const transformedOffers = typedOffers.map((offer) => ({
            id: offer._id.toString(),
            name: offer.name,
            description: offer.description,
            price: offer.price,
            discount_percent: offer.discountPercent || 0,
            poster_url: offer.posterUrl,
            hosting_type: offer.hostingType,
        }));

        return NextResponse.json(transformedOffers);
    } catch (error) {
        console.error('Error fetching bundle offers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bundle offers' },
            { status: 500 }
        );
    }
}
