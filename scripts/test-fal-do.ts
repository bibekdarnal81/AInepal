import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { AIModelApiKey } from '../lib/mongodb/models';
import { decryptApiKey } from '../lib/ai-encryption';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testFalAsync() {
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
        const modelId = 'fal-ai/fast-sdxl';

        console.log(`Sending POST to ${url}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_id: modelId,
                input: {
                    prompt: "A futuristic city at sunset, synthwave style",
                    image_size: "landscape_4_3",
                    num_inference_steps: 4,
                    guidance_scale: 3.5,
                    num_images: 1,
                    enable_safety_checker: true
                }
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        console.log('Response Body:', text);

        try {
            const data = JSON.parse(text);
            if (data.request_id || data.uuid) {
                const requestId = data.request_id || data.uuid;
                console.log('\nRequest ID:', requestId);

                // Wait a bit
                await new Promise(r => setTimeout(r, 2000));

                // Try Endpoint 1: GET /v1/async-invoke/{id}
                const statusUrl1 = `https://inference.do-ai.run/v1/async-invoke/${requestId}`;
                console.log(`\nTesting Status Endpoint 1: ${statusUrl1}`);
                const res1 = await fetch(statusUrl1, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                console.log(`Endpoint 1 Status: ${res1.status}`);
                if (res1.ok) {
                    console.log('Endpoint 1 Body:', await res1.text());
                }

                // If Endpoint 1 404s, try Endpoint 2: GET /v1/async-result/{id} (common pattern)
                if (res1.status === 404) {
                    const statusUrl2 = `https://inference.do-ai.run/v1/async-result/${requestId}`;
                    console.log(`\nTesting Status Endpoint 2: ${statusUrl2}`);
                    const res2 = await fetch(statusUrl2, {
                        headers: { 'Authorization': `Bearer ${apiKey}` }
                    });
                    console.log(`Endpoint 2 Status: ${res2.status}`);
                    if (res2.ok) {
                        console.log('Endpoint 2 Body:', await res2.text());
                    }
                }
            }
        } catch (e) {
            console.log('Response is not JSON');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testFalAsync();
