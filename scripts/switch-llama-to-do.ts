import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel } from '../lib/mongodb/models/AIModel';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function switchLlamaToDigitalOcean() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the Llama 3.1 model
        const model = await AIModel.findOne({
            displayName: 'Llama 3.1 Instruct (8B)'
        });

        if (!model) {
            console.error('Model "Llama 3.1 Instruct (8B)" not found.');
            return;
        }

        console.log(`Found model: ${model.displayName} (${model.provider})`);

        // Update provider and modelId
        model.provider = 'digitalocean';
        // DigitalOcean GenAI usually uses the model name or ID. 
        // We'll use a standard identifier. User can update in Admin UI if their specific deployment differs.
        model.modelId = 'llama-3.1-8b-instruct';

        // Ensure supportsStreaming is preserved/set
        model.supportsStreaming = true;

        await model.save();
        console.log(`Successfully switched model to provider: ${model.provider}`);
        console.log(`New Model ID: ${model.modelId}`);

    } catch (error) {
        console.error('Error switching model:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

switchLlamaToDigitalOcean();
