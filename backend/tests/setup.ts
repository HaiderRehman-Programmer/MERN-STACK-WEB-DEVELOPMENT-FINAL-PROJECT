import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

let mongod: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Set in process env so environment-aware modules can pick it up
    process.env.DATABASE_URL = uri;
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  } catch (err) {
    console.error('❌ Failed to start in-memory MongoDB:', err);
    // Fallback to local db if memory server fails
    const uri = 'mongodb://127.0.0.1:27017/lms_project_test';
    process.env.DATABASE_URL = uri;
    if (mongoose.connection.readyState === 0) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 500,
        });
      } catch (e) {
        console.warn('⚠️ Local MongoDB fallback failed too.');
      }
    }
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    } catch {}
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.dropDatabase();
    } catch {}
    try {
      await mongoose.disconnect();
    } catch {}
  }
  if (mongod) {
    try {
      await mongod.stop();
    } catch {}
  }
});

