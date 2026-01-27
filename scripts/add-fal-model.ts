import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel, AIModelApiKey } from '../lib/mongodb/models';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addFalModel() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check for API Key
        const apiKey = await AIModelApiKey.findOne({ provider: 'digitalocean' });
        if (!apiKey) {
            console.warn('⚠️ WARNING: No API Key found for "digitalocean" provider. You must add it in the Admin UI.');
        } else {
            console.log('✅ DigitalOcean API Key configuration found.');
        }

        const modelData = {
            modelId: 'fal-ai/fast-sdxl',
            displayName: 'Fal.ai Fast SDXL',
            description: 'Fast Stable Diffusion XL via DigitalOcean',
            apiEndpoint: 'https://inference.do-ai.run/v1/async-invoke',
            pricePer1kInput: 0,
            pricePer1kOutput: 0.04 // Approx per image
        };

        const exists = await AIModel.findOne({
            provider: 'digitalocean',
            modelId: modelData.modelId
        });

        const template = {
            provider: 'digitalocean',
            modelName: modelData.displayName,
            displayName: modelData.displayName,
            modelId: modelData.modelId,
            description: modelData.description,
            apiEndpoint: modelData.apiEndpoint,
            supportsStreaming: false, // Image generation isn't streaming text
            supportsVision: false,
            supportsImageGeneration: true,
            supportsVideoGeneration: false,
            defaultTemperature: 0.7,
            defaultMaxTokens: 2000,
            isActive: true,
            disabled: false,
            displayOrder: 0, // Make it prominent for testing
            currency: 'USD',
            pricePer1kInput: modelData.pricePer1kInput,
            pricePer1kOutput: modelData.pricePer1kOutput
        };

        if (exists) {
            console.log(`Updating ${modelData.displayName}...`);
            Object.assign(exists, template);
            await exists.save();
            console.log('Updated.');
        } else {
            console.log(`Creating ${modelData.displayName}...`);
            await AIModel.create(template);
            console.log('Created.');
        }

        console.log('\nFal.ai model processed successfully.');

    } catch (error) {
        console.error('Error adding model:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addFalModel();
