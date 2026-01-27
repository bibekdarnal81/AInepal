import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel } from '../lib/mongodb/models/AIModel';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function addLlamaModel() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const llamaModelData = {
            provider: 'bedrock',
            modelName: 'Llama 3.1 Instruct (8B)',
            displayName: 'Llama 3.1 Instruct (8B)',
            modelId: 'meta.llama3-1-8b-instruct-v1:0', // Correct Bedrock ID
            description: 'Meta Llama 3.1 8B Instruct model via AWS Bedrock',
            image: '', // Can be updated later or user can upload a thumbnail
            supportsStreaming: true,
            supportsVision: false,
            supportsImageGeneration: false,
            supportsVideoGeneration: false,
            defaultTemperature: 0.7,
            defaultMaxTokens: 2000,
            isActive: true,
            disabled: false,
            displayOrder: 10, // Adjust as needed
            currency: 'USD',
            pricePer1kInput: 0.0003,
            pricePer1kOutput: 0.0006
        };

        // Check if it already exists
        const existing = await AIModel.findOne({
            provider: llamaModelData.provider,
            modelId: llamaModelData.modelId
        });

        if (existing) {
            console.log('Model already exists, updating...');
            Object.assign(existing, llamaModelData);
            await existing.save();
            console.log('Model updated successfully:', existing.displayName);
        } else {
            console.log('Creating new model...');
            const newModel = await AIModel.create(llamaModelData);
            console.log('Model created successfully:', newModel.displayName);
        }

    } catch (error) {
        console.error('Error adding model:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

addLlamaModel();
