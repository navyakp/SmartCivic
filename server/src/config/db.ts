import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();

  if (uri) {
    try {
      console.log('[Database] Connecting to configured MONGODB_URI...');
      await mongoose.connect(uri);
      console.log('[Database] Connected to MongoDB via MONGODB_URI successfully.');
      return;
    } catch (err: any) {
      console.warn('[Database] Failed to connect to MONGODB_URI:', err.message);
      console.log('[Database] Falling back to automated in-memory MongoDB instance...');
    }
  }

  // If local URI wasn't provided or failed, try connecting to standard local default first
  try {
    console.log('[Database] Checking local mongodb://127.0.0.1:27017/SmartCivic ...');
    await mongoose.connect('mongodb://127.0.0.1:27017/SmartCivic', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('[Database] Connected to local MongoDB instance.');
    return;
  } catch {
    console.log('[Database] Local MongoDB daemon not running. Initializing isolated MongoMemoryServer...');
  }

  try {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: 'SmartCivic',
      },
    });
    const memoryUri = memoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to MongoMemoryServer at ${memoryUri}`);
  } catch (memErr: any) {
    console.error('[Database] Fatal: Unable to initialize MongoMemoryServer:', memErr.message);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

