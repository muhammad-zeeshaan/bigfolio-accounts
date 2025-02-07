import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
    throw new Error("Missing DATABASE_URL in environment variables");
}

let cached = global.mongoose || { conn: null, promise: null };

export const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

global.mongoose = cached;
