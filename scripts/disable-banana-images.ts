import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function disableBananaImages() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const AIModelSchema = new mongoose.Schema({}, { strict: false });
        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', AIModelSchema);

        const modelsToUpdate = ['nano-banana-pro', 'nano-banana'];

        for (const modelName of modelsToUpdate) {
            const result = await AIModel.updateOne(
                { modelName: modelName },
                { $set: { supportsImageGeneration: false } }
            );

            if (result.matchedCount > 0) {
                console.log(`Updated ${modelName}: supportsImageGeneration = false`);
            } else {
                console.log(`Model ${modelName} not found.`);
            }
        }

        console.log('Finished updating models.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

disableBananaImages();
