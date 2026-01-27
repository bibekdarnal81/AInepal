import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel, AIModelApiKey } from '../lib/mongodb/models';
import { decryptApiKey } from '../lib/ai-encryption';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listDigitalOceanModels() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get any DigitalOcean model to reuse its config (endpoint/key)
        const modelConfig = await AIModel.findOne({
            provider: 'digitalocean'
        });

        if (!modelConfig) {
            console.log('No DigitalOcean model found. Listing all models to debug:');
            const allModels = await AIModel.find({}, 'displayName provider');
            console.log(allModels);
            throw new Error('No DigitalOcean model found');
        }

        // 2. Get the API Key
        const apiKeyDoc = await AIModelApiKey.findOne({ provider: modelConfig.provider });
        if (!apiKeyDoc) {
            throw new Error(`API key not configured for provider: ${modelConfig.provider}`);
        }

        let apiKey = '';
        try {
            apiKey = decryptApiKey(apiKeyDoc.encryptedApiKey, apiKeyDoc.encryptionIv);
        } catch (error) {
            throw new Error('Encryption error');
        }

        // 3. Construct models endpoint
        // Assuming /v1/chat/completions -> /v1/models
        let modelsEndpoint = 'https://api.digitalocean.com/v1/genai/models'; // Default guess

        if (modelConfig.apiEndpoint) {
            // Try to derive base URL
            // e.g. https://inference.do-ai.run/v1/chat/completions -> https://inference.do-ai.run/v1/models
            if (modelConfig.apiEndpoint.includes('/chat/completions')) {
                modelsEndpoint = modelConfig.apiEndpoint.replace('/chat/completions', '/models');
            } else {
                // Fallback or just try appending /models if it looks like a base
                modelsEndpoint = new URL('/v1/models', modelConfig.apiEndpoint).toString();
            }
        }

        console.log('Fetching models from:', modelsEndpoint);

        const response = await fetch(modelsEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to list models: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('\nAvailable Models:');
        console.log(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listDigitalOceanModels();
