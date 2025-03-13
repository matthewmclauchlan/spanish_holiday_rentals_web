/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '../.env' });

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI is not defined in the environment');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    // Replace 'chat-app' with your desired database name.
    database = client.db('chat-app');
    return database;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
}

module.exports = { connectDB, client };
