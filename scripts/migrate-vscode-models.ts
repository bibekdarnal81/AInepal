import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateModels() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const AIModel = mongoose.models.AIModel || mongoose.model('AIModel', new mongoose.Schema({}, { strict: false }));

        console.log('Updating all models to set availableInVSCode = true...');

        const result = await AIModel.updateMany(
            { availableInVSCode: { $exists: false } },
            { $set: { availableInVSCode: true } }
        );

        console.log(`Migration Complete.`);
        console.log(`Matched: ${result.matchedCount}`);
        console.log(`Modified: ${result.modifiedCount}`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateModels();
