import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel } from '../lib/mongodb/models';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addOpenAITTS() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const models = [
            {
                modelId: 'tts-1',
                displayName: 'OpenAI TTS-1',
                description: 'Standard Text-to-Speech model',
                provider: 'openai',
                apiEndpoint: 'https://api.openai.com/v1',
                pricePer1kInput: 0.015,
                pricePer1kOutput: 0
            },
            {
                modelId: 'tts-1-hd',
                displayName: 'OpenAI TTS-1 HD',
                description: 'High Definition Text-to-Speech model',
                provider: 'openai',
                apiEndpoint: 'https://api.openai.com/v1',
                pricePer1kInput: 0.030,
                pricePer1kOutput: 0
            }
        ];

        for (const modelData of models) {
            const exists = await AIModel.findOne({
                provider: 'openai',
                modelId: modelData.modelId
            });

            const template = {
                provider: 'openai',
                modelName: modelData.displayName,
                displayName: modelData.displayName,
                modelId: modelData.modelId,
                description: modelData.description,
                apiEndpoint: modelData.apiEndpoint,
                supportsStreaming: false,
                supportsVision: false,
                supportsImageGeneration: false,
                supportsVideoGeneration: false,
                supportsAudioGeneration: true,
                defaultTemperature: 1.0,
                defaultMaxTokens: 0,
                isActive: true,
                disabled: false,
                displayOrder: 2, // After Fal.ai
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

        console.log('\nOpenAI TTS models processed successfully.');

    } catch (error) {
        console.error('Error adding model:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addOpenAITTS();
