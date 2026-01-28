import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkActiveModels() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Schemas
        const AIModelSchema = new mongoose.Schema({}, { strict: false });
        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', AIModelSchema);

        const AIModelApiKeySchema = new mongoose.Schema({}, { strict: false });
        const AIModelApiKey = mongoose.models.AIModelApiKey || mongoose.model('AIModelApiKey', AIModelApiKeySchema);

        // 1. Get all active models
        const activeModels = await AIModel.find({
            isActive: true,
            disabled: { $ne: true }
        }).sort({ displayOrder: 1 });

        console.log(`\nFound ${activeModels.length} active models.`);

        // 2. Get all configured providers
        const apiKeys = await AIModelApiKey.find({});
        const configuredProviders = new Set(apiKeys.map(k => k.provider));
        console.log('Configured Providers:', Array.from(configuredProviders).join(', '));

        console.log('\n--- VS Code Available Models ---');
        let count = 0;
        for (const model of activeModels) {
            const hasKey = configuredProviders.has(model.provider);
            const status = hasKey ? '✅ AVAILABLE' : '❌ NO API KEY';

            if (hasKey) {
                console.log(`\n[${status}]`);
                console.log(`Name: ${model.displayName}`);
                console.log(`Model ID: ${model.modelId}`);
                console.log(`Provider: ${model.provider}`);
                console.log(`Description: ${model.description || 'N/A'}`);
                count++;
            }
        }
        console.log(`\nTotal Available Models: ${count}`);
        console.log('-------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkActiveModels();
