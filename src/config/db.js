import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export async function connectDB(customUri) {
  const targetUri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tworld_posting';

  try {
    // Attempt standard connection with 1.5s server selection timeout
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 1500
    });
    console.log(`[Database] Connected successfully to MongoDB at: ${targetUri}`);
  } catch (err) {
    console.warn(`[Database] Standalone MongoDB connection failed (${err.message}). Starting in-memory MongoMemoryServer...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Connected to MongoMemoryServer at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Unable to initialize any MongoDB instance.', memErr);
      throw memErr;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
