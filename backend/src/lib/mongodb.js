import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://**********:************@cluster0.dnuzjfz.mongodb.net/eventra";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "eventra",
    });
  }

  cached.conn = await cached.promise;
  console.log("MongoDB Connected ✅");

  return cached.conn;
};