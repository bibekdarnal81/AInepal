import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel } from '../lib/mongodb/models';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function setLlamaAsDefault() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const targetModelName = 'Llama 3.1 Instruct (8B)';
        const targetModel = await AIModel.findOne({ displayName: targetModelName });

        if (!targetModel) {
            throw new Error(`Model "${targetModelName}" not found.`);
        }

        console.log(`Setting "${targetModelName}" as default (displayOrder: 0)`);

        // Shift all models down to make space at 0
        // We'll increment everyone's displayOrder by 1
        await AIModel.updateMany({}, { $inc: { displayOrder: 1 } });

        // Now set Llama to 0
        targetModel.displayOrder = 0;
        await targetModel.save();

        console.log('Successfully updated display order.');

        // Verify
        const newFirst = await AIModel.findOne({ isActive: true, disabled: { $ne: true } }).sort({ displayOrder: 1 });
        console.log(`New Default Model: ${newFirst?.displayName} (Order: ${newFirst?.displayOrder})`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

setLlamaAsDefault();
