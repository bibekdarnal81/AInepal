import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel } from '../lib/mongodb/models';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkDisplayOrders() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const models = await AIModel.find({}, 'displayName displayOrder provider isActive disabled')
            .sort({ displayOrder: 1 });

        console.log('\n--- Current Model Order ---');
        models.forEach(m => {
            console.log(`${m.displayOrder ?? 'N/A'}: ${m.displayName} (${m.provider}) [Active: ${m.isActive}, Disabled: ${m.disabled}]`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

checkDisplayOrders();
