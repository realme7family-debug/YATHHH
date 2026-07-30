import { MongoClient, Db } from 'mongodb';
import { birthdayConfig, BirthdayConfigType } from '../config/birthdayConfig';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'yaathh_birthday';
const COLLECTION_NAME = 'config';
const MEDIA_COLLECTION = 'media';

// Primary Single Source of Truth Global Cloud Database Endpoint
const GLOBAL_CLOUD_DB_BASE = 'https://crudcrud.com/api/318219a1537140e8a665fc86f1610e59/config';
const GLOBAL_CLOUD_DOC_ID = '6a6b7a6280807903e8b0e435';
const GLOBAL_CLOUD_DOC_URL = `${GLOBAL_CLOUD_DB_BASE}/${GLOBAL_CLOUD_DOC_ID}`;

// Global cache for MongoDB serverless connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getMongoDb(): Promise<Db | null> {
  if (!MONGODB_URI || MONGODB_URI.includes('cluster0.mongodb.net')) {
    return null;
  }
  if (cachedDb) return cachedDb;

  try {
    if (!cachedClient) {
      cachedClient = new MongoClient(MONGODB_URI, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      await cachedClient.connect();
    }
    cachedDb = cachedClient.db(DB_NAME);
    return cachedDb;
  } catch (error) {
    console.warn('MongoDB Atlas connection unavailable, falling back to Global Cloud DB REST:', error);
    return null;
  }
}

/**
 * Fetch latest config from single Global Cloud Database REST endpoint
 */
async function fetchGlobalCloudConfig(): Promise<BirthdayConfigType | null> {
  try {
    const res = await fetch(`${GLOBAL_CLOUD_DB_BASE}?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const docs = await res.json();
      if (Array.isArray(docs) && docs.length > 0) {
        const latestDoc = docs[docs.length - 1];
        const { _id, ...cleanData } = latestDoc;
        if (cleanData && cleanData.name) {
          return { ...birthdayConfig, ...cleanData };
        }
      }
    }
  } catch (err) {
    console.error('Error fetching from Global Cloud DB REST:', err);
  }
  return null;
}

/**
 * Save updated config to single Global Cloud Database REST endpoint
 */
async function saveGlobalCloudConfig(config: BirthdayConfigType): Promise<BirthdayConfigType> {
  try {
    const { _id, ...cleanPayload } = config as any;

    // Try updating existing document
    const putRes = await fetch(GLOBAL_CLOUD_DOC_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      body: JSON.stringify(cleanPayload),
    });

    if (putRes.ok || putRes.status === 200) {
      return { ...birthdayConfig, ...cleanPayload };
    } else {
      // If PUT fails, post new document
      const postRes = await fetch(GLOBAL_CLOUD_DB_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        body: JSON.stringify(cleanPayload),
      });

      if (postRes.ok) {
        const json = await postRes.json();
        const { _id: newId, ...savedData } = json;
        return { ...birthdayConfig, ...savedData };
      }
    }
  } catch (err) {
    console.error('Error saving to Global Cloud DB REST:', err);
  }
  return config;
}

/**
 * GET current configuration from Single Production Database
 */
export async function getDatabaseConfig(): Promise<BirthdayConfigType> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      const doc = await collection.findOne({ _id: 'production_config' as any });
      if (doc && doc.config) {
        return { ...birthdayConfig, ...doc.config };
      } else {
        await collection.updateOne(
          { _id: 'production_config' as any },
          { $set: { config: birthdayConfig, updatedAt: new Date() } },
          { upsert: true }
        );
        return birthdayConfig;
      }
    } catch (err) {
      console.error('Error fetching config from MongoDB Atlas:', err);
    }
  }

  // Single Global Cloud Database endpoint
  const cloudData = await fetchGlobalCloudConfig();
  if (cloudData) {
    return cloudData;
  }

  return birthdayConfig;
}

/**
 * SAVE/UPDATE configuration in Single Production Database
 */
export async function saveDatabaseConfig(newConfig: BirthdayConfigType): Promise<BirthdayConfigType> {
  if (!newConfig || typeof newConfig !== 'object') {
    throw new Error('Invalid configuration object');
  }

  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      await collection.updateOne(
        { _id: 'production_config' as any },
        { $set: { config: newConfig, updatedAt: new Date() } },
        { upsert: true }
      );
      const updatedDoc = await collection.findOne({ _id: 'production_config' as any });
      if (updatedDoc && updatedDoc.config) {
        saveGlobalCloudConfig(updatedDoc.config as BirthdayConfigType).catch(() => {});
        return { ...birthdayConfig, ...updatedDoc.config };
      }
    } catch (err) {
      console.error('Error saving config to MongoDB Atlas:', err);
    }
  }

  // Save to single Global Cloud Database endpoint
  return await saveGlobalCloudConfig(newConfig);
}

/**
 * RESET configuration to defaults in Single Production Database
 */
export async function resetDatabaseConfig(): Promise<BirthdayConfigType> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection(COLLECTION_NAME);
      await collection.updateOne(
        { _id: 'production_config' as any },
        { $set: { config: birthdayConfig, updatedAt: new Date() } },
        { upsert: true }
      );
      saveGlobalCloudConfig(birthdayConfig).catch(() => {});
      return birthdayConfig;
    } catch (err) {
      console.error('Error resetting config in MongoDB Atlas:', err);
    }
  }

  return await saveGlobalCloudConfig(birthdayConfig);
}

/**
 * SAVE Media File (Photo/Audio) into Database / Storage
 */
export async function saveMediaFile(dataUrl: string, fileName: string): Promise<string> {
  const db = await getMongoDb();
  if (db) {
    try {
      const collection = db.collection(MEDIA_COLLECTION);
      const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await collection.insertOne({
        _id: mediaId as any,
        fileName,
        dataUrl,
        createdAt: new Date(),
      });
      return dataUrl;
    } catch (err) {
      console.error('Error saving media file to DB:', err);
    }
  }
  return dataUrl;
}
