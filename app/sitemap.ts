import dbConnect from '@/lib/mongodb/client'
import { Service } from '@/lib/mongodb/models'

// Generate static params for sitemap
export async function generateSitemapData() {
    await dbConnect()

    const services = await Service.find({ isPublished: true })
        .select('slug updatedAt')
        .lean()

    const typedServices = services as Array<{ slug: string; updatedAt?: Date }>
    return typedServices.map((s) => ({
        url: `/services/${s.slug}`,
        lastModified: s.updatedAt || new Date(),
    }))
}

export default async function sitemap() {
    await dbConnect()

    const services = await Service.find({ isPublished: true })
        .select('slug updatedAt')
        .lean()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://AINepal.tech'

    const staticRoutes = [
        { url: baseUrl, lastModified: new Date() },
        { url: `${baseUrl}/services`, lastModified: new Date() },
        { url: `${baseUrl}/classes`, lastModified: new Date() },
        { url: `${baseUrl}/projects`, lastModified: new Date() },
        { url: `${baseUrl}/blog`, lastModified: new Date() },
        { url: `${baseUrl}/careers`, lastModified: new Date() },
        { url: `${baseUrl}/contact`, lastModified: new Date() },
        { url: `${baseUrl}/book-demo`, lastModified: new Date() },
    ]

    const typedServices = services as Array<{ slug: string; updatedAt?: Date }>
    const serviceRoutes = typedServices.map((s) => ({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: s.updatedAt || new Date(),
    }))

    return [...staticRoutes, ...serviceRoutes]
}
