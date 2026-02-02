import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { Portfolio } from '@/lib/mongodb/models';

export async function GET() {
    try {
        await dbConnect();

        const portfolios = await Portfolio.find({
            isPublished: true
        })
            .sort({ displayOrder: 1 })
            .limit(6)
            .lean();

        // Transform to match frontend interface
        const typedPortfolios = portfolios as unknown as Array<{
            _id: string
            title: string
            slug: string
            description?: string
            imageUrl?: string
            clientName?: string
            category?: string
            technologies?: string[]
            projectUrl?: string
            isFeatured?: boolean
            displayOrder?: number
        }>
        const transformedPortfolios = typedPortfolios.map((p) => ({
            id: p._id.toString(),
            title: p.title,
            slug: p.slug,
            description: p.description,
            image_url: p.imageUrl, // Map camelCase to snake_case
            client_name: p.clientName,
            category: p.category,
            technologies: p.technologies || [],
            project_url: p.projectUrl,
            is_featured: p.isFeatured,
            display_order: p.displayOrder
        }));

        return NextResponse.json(transformedPortfolios);

    } catch (error) {
        console.error('Error fetching portfolios:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portfolios' },
            { status: 500 }
        );
    }
}
