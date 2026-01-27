import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel } from '../lib/mongodb/models/AIModel';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function updateLlamaConfig() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the Llama 3.1 model - checking by provider or name
        // We know we just set it to digitalocean
        const model = await AIModel.findOne({
            displayName: 'Llama 3.1 Instruct (8B)'
        });

        if (!model) {
            console.error('Model not found.');
            return;
        }

        console.log(`Updating config for: ${model.displayName}`);

        // Update with values from user snippet
        model.provider = 'digitalocean';
        model.modelId = 'llama3-8b-instruct';
        model.apiEndpoint = 'https://inference.do-ai.run/v1/chat/completions';

        await model.save();
        console.log(`Successfully updated model configuration:`);
        console.log(`- Model ID: ${model.modelId}`);
        console.log(`- Endpoint: ${model.apiEndpoint}`);

    } catch (error) {
        console.error('Error updating model:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateLlamaConfig();
