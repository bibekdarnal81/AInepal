import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModel, AIModelApiKey } from '../lib/mongodb/models';
import { decryptApiKey } from '../lib/ai-encryption';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDigitalOceanConnection() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get the Model Configuration
        const modelConfig = await AIModel.findOne({
            displayName: 'Llama 3.1 Instruct (8B)'
        });

        if (!modelConfig) {
            throw new Error('Model "Llama 3.1 Instruct (8B)" not found');
        }

        console.log('Model Config:', {
            provider: modelConfig.provider,
            modelId: modelConfig.modelId,
            apiEndpoint: modelConfig.apiEndpoint
        });

        // 2. Get the API Key
        const apiKeyDoc = await AIModelApiKey.findOne({ provider: modelConfig.provider });
        if (!apiKeyDoc) {
            throw new Error(`API key not configured for provider: ${modelConfig.provider}`);
        }

        // 3. Decrypt the API Key
        let apiKey = '';
        try {
            apiKey = decryptApiKey(apiKeyDoc.encryptedApiKey, apiKeyDoc.encryptionIv);
            console.log('API Key decrypted successfully (length):', apiKey.length);
        } catch (error) {
            console.error('Error decrypting API key:', error);
            throw new Error('Configuration error (Encryption)');
        }

        // 4. Test Call
        const messages = [
            { role: 'user', content: 'What is the capital of France?' }
        ];

        const endpoint = modelConfig.apiEndpoint || 'https://api.digitalocean.com/v1/genai/chat/completions';
        console.log('Testing endpoint:', endpoint);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelConfig.modelId,
                messages,
                max_tokens: 100
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Success Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testDigitalOceanConnection();
