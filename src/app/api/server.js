import { connectDB } from "../../lib/db"; // Move DB logic here
import mongoose from "mongoose";
import express from "express";
import next from "next";

const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

const server = express();

server.all("*", (req, res) => handle(req, res));

export default async function handler(req, res) {
    if (mongoose.connection.readyState !== 1) {
        await connectDB();
    }
    server(req, res);
}
