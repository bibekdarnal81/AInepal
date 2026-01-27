
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb/client';
import {
    Project, ProjectCategory,
    Career,
    Class,
    Post, PostCategory
} from '../lib/mongodb/models';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('Starting migration...');
    await dbConnect();

    // 1. Projects and Project Categories
    console.log('Migrating Projects...');
    const { data: projectCategories } = await supabase.from('project_categories').select('*');
    const categoryMap = new Map();

    if (projectCategories) {
        for (const cat of projectCategories) {
            const newCat = await ProjectCategory.findOneAndUpdate(
                { slug: cat.slug },
                {
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                    iconName: cat.icon_name, // Mapping snake_case to camelCase
                    color: cat.color,
                    isPublished: true
                },
                { upsert: true, new: true }
            );
            categoryMap.set(cat.id, newCat._id);
        }
        console.log(`Migrated ${projectCategories.length} project categories.`);
    }

    const { data: projects } = await supabase.from('projects').select('*');
    if (projects) {
        for (const p of projects) {
            await Project.findOneAndUpdate(
                { slug: p.slug },
                {
                    title: p.title,
                    slug: p.slug,
                    description: p.description,
                    content: p.content,
                    thumbnailUrl: p.thumbnail_url,
                    githubUrl: p.github_url,
                    liveUrl: p.live_url,
                    technologies: p.technologies,
                    features: p.features,
                    categoryId: p.category_id ? categoryMap.get(p.category_id) : undefined,
                    isFeatured: p.is_featured,
                    isPublished: p.published, // Note: published vs isPublished
                    createdAt: p.created_at,
                    updatedAt: p.updated_at
                },
                { upsert: true }
            );
        }
        console.log(`Migrated ${projects.length} projects.`);
    }

    // 2. Careers
    console.log('Migrating Careers...');
    const { data: careers } = await supabase.from('careers').select('*');
    if (careers) {
        for (const c of careers) {
            await Career.findOneAndUpdate(
                { slug: c.slug },
                {
                    title: c.title,
                    slug: c.slug,
                    department: c.department, // Assuming field matches
                    location: c.location,
                    type: c.type,
                    description: c.description,
                    requirements: c.requirements,
                    responsibilities: c.responsibilities,
                    salary: c.salary,
                    isPublished: c.is_active, // active -> isPublished
                    expiresAt: c.expires_at,
                    createdAt: c.created_at
                },
                { upsert: true }
            );
        }
        console.log(`Migrated ${careers.length} careers.`);
    }

    // 3. Classes
    console.log('Migrating Classes...');
    const { data: classes } = await supabase.from('classes').select('*');
    if (classes) {
        for (const c of classes) {
            await Class.findOneAndUpdate(
                { slug: c.slug },
                {
                    title: c.title,
                    slug: c.slug,
                    description: c.description, // Might map to summmary or description
                    summary: c.summary || c.description,
                    level: c.level,
                    duration: c.duration,
                    price: c.price,
                    currency: c.currency || 'NPR',
                    instructor: c.instructor, // String or Object? Model expects string name typically or ID
                    startDate: c.start_date,
                    schedule: c.schedule,
                    syllabus: c.syllabus, // JSON/Map
                    prerequisites: c.prerequisites,
                    maxStudents: c.max_students,
                    enrolledCount: c.enrolled_count,
                    isFeatured: c.is_featured,
                    isActive: c.is_active,
                    thumbnailUrl: c.thumbnail_url,
                    createdAt: c.created_at
                },
                { upsert: true }
            );
        }
        console.log(`Migrated ${classes.length} classes.`);
    }

    // 4. Blog Posts and Categories
    console.log('Migrating Blog Posts...');
    const { data: postCategories } = await supabase.from('post_categories').select('*');
    const postCategoryMap = new Map();

    if (postCategories) {
        for (const cat of postCategories) {
            const newCat = await PostCategory.findOneAndUpdate(
                { slug: cat.slug },
                {
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description,
                    iconName: cat.icon_name,
                    color: cat.color,
                    isPublished: true // Default true for migrated
                },
                { upsert: true, new: true }
            );
            postCategoryMap.set(cat.id, newCat._id);
        }
        console.log(`Migrated ${postCategories.length} post categories.`);
    }

    const { data: posts } = await supabase.from('posts').select('*');
    if (posts) {
        for (const p of posts) {
            await Post.findOneAndUpdate(
                { slug: p.slug },
                {
                    title: p.title,
                    slug: p.slug,
                    excerpt: p.excerpt,
                    content: p.content,
                    featuredImageUrl: p.featured_image_url,
                    author: { // Simple object structure for now
                        name: 'Admin', // Default, or fetch user if user_id exists
                        avatarUrl: ''
                    },
                    categoryId: p.category_id ? postCategoryMap.get(p.category_id) : undefined,
                    tags: p.tags,
                    isPublished: p.published,
                    isFeatured: p.is_featured,
                    publishedAt: p.published_at || p.created_at,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                    readingTime: p.reading_time
                },
                { upsert: true }
            );
        }
        console.log(`Migrated ${posts.length} posts.`);
    }

    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
