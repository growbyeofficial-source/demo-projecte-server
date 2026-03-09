import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  client = new MongoClient(uri);
  await client.connect();

  // Use DB_NAME env var if set, otherwise default to 'test'
  const dbName = process.env.DB_NAME || 'test';
  db = client.db(dbName);

  console.log(`✅ Connected to MongoDB database: "${dbName}"`);

  const collections = await db.listCollections().toArray();
  console.log(`📂 Collections found: ${collections.map(c => c.name).join(', ') || 'none'}`);

  return db;
}

export async function getDB(): Promise<Db> {
  if (!db) {
    return connectDB();
  }
  return db;
}
