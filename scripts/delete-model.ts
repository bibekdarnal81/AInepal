import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function deleteModel() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', new mongoose.Schema({}, { strict: false }));

        // Delete the bad model
        const result = await AIModel.deleteOne({ modelId: 'openai-default' });

        if (result.deletedCount === 1) {
            console.log('Successfully deleted model "openai-default"');
        } else {
            console.log('Model "openai-default" not found or already deleted');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

deleteModel();
