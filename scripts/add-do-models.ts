import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel, AIModelApiKey } from '../lib/mongodb/models';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MODELS_TO_ADD = [
    {
        modelId: 'llama3-8b-instruct',
        displayName: 'Llama 3.1 Instruct (8B)',
        description: 'Meta Llama 3.1 8B Instruct model via DigitalOcean',
        // Common DigitalOcean endpoint
        apiEndpoint: 'https://inference.do-ai.run/v1/chat/completions',
        pricePer1kInput: 0.0003, // Estimates
        pricePer1kOutput: 0.0006
    },
    {
        modelId: 'llama3-70b-instruct',
        displayName: 'Llama 3.1 Instruct (70B)',
        description: 'Meta Llama 3.1 70B Instruct model via DigitalOcean',
        apiEndpoint: 'https://inference.do-ai.run/v1/chat/completions',
        pricePer1kInput: 0.0007,
        pricePer1kOutput: 0.0009
    },
    {
        modelId: 'mixtral-8x7b-instruct',
        displayName: 'Mixtral 8x7B Instruct',
        description: 'Mistral Mixtral 8x7B Instruct model via DigitalOcean',
        apiEndpoint: 'https://inference.do-ai.run/v1/chat/completions',
        pricePer1kInput: 0.0005,
        pricePer1kOutput: 0.0007
    }
];

async function addDigitalOceanModels() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check for API Key
        const apiKey = await AIModelApiKey.findOne({ provider: 'digitalocean' });
        if (!apiKey) {
            console.warn('⚠️ WARNING: No API Key found for "digitalocean" provider. You must add it in the Admin UI for these models to work.');
        } else {
            console.log('✅ DigitalOcean API Key configuration found.');
        }

        for (const modelData of MODELS_TO_ADD) {
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
                supportsStreaming: true,
                supportsVision: false,
                supportsImageGeneration: false,
                supportsVideoGeneration: false,
                defaultTemperature: 0.7,
                defaultMaxTokens: 2000,
                isActive: true,
                disabled: false,
                displayOrder: 10,
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
        }

        console.log('\nAll models processed successfully.');

    } catch (error) {
        console.error('Error adding models:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addDigitalOceanModels();
