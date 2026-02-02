import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { HostingPlan } from '@/lib/mongodb/models';

export async function GET() {
    try {
        await dbConnect();

        const plans = await HostingPlan.find({
            isActive: true
        })
            .sort({ price: 1 })
            .lean();

        // Transform to match frontend interface
        const typedPlans = plans as unknown as Array<{
            _id: string
            name: string
            slug: string
            type?: string
            storageGb?: number
            bandwidthText?: string
            price: number
            priceYearly?: number
            features?: string[]
            isActive: boolean
        }>
        const transformedPlans = typedPlans.map((p) => ({
            id: p._id.toString(),
            name: p.name,
            slug: p.slug,
            type: p.type,
            storage_gb: p.storageGb, // Map camelCase to snake_case
            bandwidth_text: p.bandwidthText,
            price: p.price,
            price_yearly: p.priceYearly,
            features: p.features || [],
            is_active: p.isActive
        }));

        return NextResponse.json(transformedPlans);

    } catch (error) {
        console.error('Error fetching hosting plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hosting plans' },
            { status: 500 }
        );
    }
}
