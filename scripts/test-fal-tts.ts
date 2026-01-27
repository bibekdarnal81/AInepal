import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModelApiKey } from '../lib/mongodb/models';
import { decryptApiKey } from '../lib/ai-encryption';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFalTTS() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found');
        }

        await mongoose.connect(process.env.MONGODB_URI);

        // Get DO Key
        const apiKeyDoc = await AIModelApiKey.findOne({ provider: 'digitalocean' });
        if (!apiKeyDoc) throw new Error('No DigitalOcean API Key found');

        const apiKey = decryptApiKey(apiKeyDoc.encryptedApiKey, apiKeyDoc.encryptionIv);
        console.log('API Key verified.');

        const url = 'https://inference.do-ai.run/v1/async-invoke';
        // Trying PlayAI TTS
        const modelId = 'fal-ai/playai/tts/v3';

        console.log(`Sending POST to ${url} for ${modelId}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_id: modelId,
                input: {
                    input: "Hello, this is a test of using PlayAI text to speech on DigitalOcean.",
                    voice: "Jennifer (English (US)/Female)"
                }
            })
        });

        const text = await response.text();
        console.log('Submit Response:', text);

        try {
            const data = JSON.parse(text);
            const requestId = data.request_id || data.uuid;

            if (requestId) {
                console.log('\nRequest ID:', requestId);

                // Poll
                for (let i = 0; i < 10; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    const statusUrl = `https://inference.do-ai.run/v1/async-invoke/${requestId}`;
                    const res = await fetch(statusUrl, {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                    const statusData = await res.json();
                    console.log(`Poll ${i + 1}: ${statusData.status}`);

                    if (statusData.status === 'COMPLETED') {
                        console.log('Result:', JSON.stringify(statusData.output, null, 2));
                        break;
                    }
                }
            }
        } catch (e) {
            // ignore
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testFalTTS();
