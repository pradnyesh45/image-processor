const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  await client.connect();
  db = client.db("image_processing");
  console.log("Connected to MongoDB");
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
}

module.exports = { connectDB, getDB };
