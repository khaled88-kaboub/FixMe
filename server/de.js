import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import interventionRoutes from "./routes/intervention.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ à sécuriser en prod
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/interventions", interventionRoutes);

// ⚡ Partage du socket pour notifier les clients
app.set("io", io);

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB connecté");
  server.listen(5000, () => console.log("🚀 Serveur sur port 5000"));
});
