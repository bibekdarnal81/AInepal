import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedImageModels() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const AIModelSchema = new mongoose.Schema({}, { strict: false });
        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', AIModelSchema);

        const models = [
            {
                provider: 'google',
                modelName: 'nano-banana-pro',
                displayName: 'Nano Banana Pro',
                modelId: 'gemini-1.5-pro',
                description: "Google's latest multimodal model capable of producing crisp, high-quality images with advanced text-image generation abilities",
                supportsImageGeneration: true,
                supportsVision: true,
                supportsStreaming: true,
                isActive: true,
                image: '', // User can set this in Admin
                displayOrder: 10
            },
            {
                provider: 'google',
                modelName: 'nano-banana',
                displayName: 'Nano Banana',
                modelId: 'gemini-1.5-flash',
                description: "Google's lightweight multimodal model capable of quickly generating high-quality images for everyday creative tasks",
                supportsImageGeneration: true,
                supportsVision: true,
                supportsStreaming: true,
                isActive: true,
                image: '', // User can set this in Admin
                displayOrder: 11
            }
        ];

        for (const modelData of models) {
            // Check if exists by provider + modelName
            const existing = await AIModel.findOne({
                provider: modelData.provider,
                modelName: modelData.modelName
            });

            if (existing) {
                console.log(`Updating existing model: ${modelData.displayName}`);
                Object.assign(existing, modelData);
                await existing.save();
            } else {
                console.log(`Creating new model: ${modelData.displayName}`);
                await AIModel.create(modelData);
            }
        }

        console.log('Successfully seeded Nano Banana models.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedImageModels();
