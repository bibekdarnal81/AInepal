
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import dbConnect from './lib/mongodb/client';
import { Project, Career, Class, Post } from './lib/mongodb/models';

async function verifyData() {
    await dbConnect();

    try {
        const projectCount = await Project.countDocuments();
        console.log(`Projects: ${projectCount}`);

        // Check if Career model exists
        try {
            const careerCount = await Career.countDocuments();
            console.log(`Careers: ${careerCount}`);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.log('Careers model/collection error:', message);
        }

        try {
            const classCount = await Class.countDocuments();
            console.log(`Classes: ${classCount}`);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.log('Classes model/collection error:', message);
        }

        try {
            // Blog logic uses 'Post' model
            const blogCount = await Post.countDocuments();
            console.log(`Posts (Blog): ${blogCount}`);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.log('Post model/collection error:', message);
        }

    } catch (error) {
        console.error('Error verifying data:', error);
    }
    process.exit(0);
}

verifyData();
