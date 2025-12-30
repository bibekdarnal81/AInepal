import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dunzo.tech'
    const supabase = await createClient()

    // Get all published services
    const { data: services } = await supabase
        .from('services')
        .select('slug, updated_at')
        .eq('is_published', true)

    // Get all published blog posts
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, created_at')
        .eq('published', true)

    const serviceUrls = services?.map((service) => ({
        url: `${baseUrl}/services/${service.slug}`,
        lastModified: new Date(service.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    })) || []

    const postUrls = posts?.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    })) || []

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        ...serviceUrls,
        ...postUrls,
    ]
}
