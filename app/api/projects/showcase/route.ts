import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb/client';
import { Project, ProjectCategory } from '@/lib/mongodb/models';

export async function GET() {
    try {
        await dbConnect();

        const [categories, projects] = await Promise.all([
            ProjectCategory.find()
                .sort({ displayOrder: 1 })
                .lean(),
            Project.find({})
                .sort({ displayOrder: 1 })
                .lean()
        ]);

        // Transform projects to match frontend interface
        // We need to manually populate or map category info since we're not using .populate() with a simple ref sometimes, 
        // or to match the specific structure expected by the frontend (which expects project_categories property)

        const typedCategories = categories as unknown as Array<{
            _id: string
            name: string
            slug: string
            color?: string
            iconName?: string
        }>
        const typedProjects = projects as unknown as Array<{
            _id: string
            title: string
            slug: string
            description?: string
            price?: number
            categoryId?: string
            techStack?: string[]
            demoUrl?: string
            githubUrl?: string
            thumbnailUrl?: string
        }>

        const categoriesMap = new Map(typedCategories.map((c) => [c._id.toString(), c]));

        const transformedProjects = typedProjects.map((p) => {
            const category = p.categoryId ? categoriesMap.get(p.categoryId.toString()) : null;

            return {
                id: p._id.toString(),
                title: p.title,
                slug: p.slug,
                description: p.description,
                price: p.price,
                category_id: p.categoryId?.toString() || null,
                tech_stack: p.techStack || [], // Ensure snake_case mapping from camelCase DB
                // DB probably uses CamelCase, frontend wants snake_case?
                // Wait, based on ID 12 (projects page), it used camelCase properties like technologies. 
                // But projects-showcase.tsx interface uses snake_case (tech_stack, github_url).
                // I need to map carefully.
                demo_url: p.demoUrl,
                github_url: p.githubUrl,
                thumbnail_url: p.thumbnailUrl,
                project_categories: category ? {
                    name: category.name,
                    slug: category.slug, // Added slug
                    color: category.color,
                    icon_name: category.iconName
                } : null
            };
        });

        const transformedCategories = typedCategories.map((c) => ({
            id: c._id.toString(),
            name: c.name,
            slug: c.slug,
            color: c.color,
            icon_name: c.iconName
        }));

        return NextResponse.json({
            categories: transformedCategories,
            projects: transformedProjects
        });

    } catch (error) {
        console.error('Error fetching showcase data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch showcase data' },
            { status: 500 }
        );
    }
}
