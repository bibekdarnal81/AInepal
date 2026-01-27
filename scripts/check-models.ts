import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkModels() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Define schema minimalistically to avoid import issues
        const AIModelSchema = new mongoose.Schema({}, { strict: false });
        // Use existing model if available (to handle hot reload issues if running in app context) or create new
        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', AIModelSchema);

        const models = await AIModel.find({});

        console.log('\n--- AI Models in Database ---');
        models.forEach(model => {
            console.log(`\nName: ${model.displayName}`);
            console.log(`Provider: ${model.provider}`);
            console.log(`Model ID (API Identifier): '${model.modelId}'`); // Quote to see whitespace
            console.log(`ID: ${model._id}`);
            console.log(`Image: ${model.image || 'N/A'}`);
            console.log(`Endpoint: ${model.apiEndpoint || 'N/A'}`);
        });
        console.log('\n-----------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkModels();
