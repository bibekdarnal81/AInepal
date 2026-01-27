
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

async function listCollections() {
    try {
        const conn = await mongoose.connect(MONGODB_URI!);
        console.log(`Connected to: ${conn.connection.db.databaseName}`);

        const collections = await conn.connection.db.listCollections().toArray();

        console.log('Collections:');
        for (const col of collections) {
            const count = await conn.connection.db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listCollections();
