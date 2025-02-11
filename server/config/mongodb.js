import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// get url from .env file
const uri = process.env.MONGODB_URI;

let db = null;
let client = null;

function connect() {
  try {
    const client = new MongoClient(uri);
    db = client.db("gc01-Joshuajulio");
  } catch (error) {
    console.log(error);
  }
}

function getDB() {
  if (!db) {
    connect();
  }
  return db;
}

export { getDB, client };

// const client = new MongoClient(uri);

// async function run() {
//   try {
//     const database = client.db("gc01-Joshuajulio");
//     const usersCollection = database.collection("users");
//     const users = await usersCollection.find().toArray();
//     console.log(users);
//   } catch (err) {
//     console.log(err.stack);
//   } finally {
//     await client.close();
//   }
// }
// run().catch(console.dir);
