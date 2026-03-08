import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "neurohire";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`MongoDB connected: ${DB_NAME}`);
  return db;
}

export async function getDB(): Promise<Db> {
  if (!db) return connectDB();
  return db;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
