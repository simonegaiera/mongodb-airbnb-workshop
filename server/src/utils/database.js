import { MongoClient, ServerApiVersion } from "mongodb";
import { mongodbUri as uri, databaseName } from '../config/config.js';

export const client = new MongoClient(uri,  {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

export let db = undefined;

export async function  connectToDatabase() {
  try {
    const conn = await client.connect();
    // console.log('Connected successfully to MongoDB server');

    db = conn.db(databaseName)

    return client;
  } catch (e) {
    console.error('Could not connect to MongoDB', e);
  }
}

connectToDatabase();
