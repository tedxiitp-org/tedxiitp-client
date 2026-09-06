import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri || "mongodb://localhost:27017/dummy", options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production / CI build environments without MONGODB_URI, provide a dummy fallback
  // so the module evaluates cleanly during `next build`
  client = new MongoClient(uri || "mongodb://localhost:27017/dummy", options);
  clientPromise = uri ? client.connect() : (Promise.resolve(client) as Promise<MongoClient>);
}

export default clientPromise;