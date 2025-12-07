// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import startMaintenanceCron from "./cron/maintenanceCron.js";



import helmet from "helmet";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/userRoute.js";
import authRoutes from "./routes/authRoutes.js";
import interventionRoutes from "./routes/interventionController.js";

import ligneRoutes from "./routes/ligneRoute.js";
import equipementRoutes from "./routes/equipementRoute.js";
import rapportInterventionRoutes from "./routes/rapportInterventionRoute.js";
import technicienRoutes from "./routes/technicienRoute.js";
import maintenanceRoutes from "./routes/maintenancePreventiveRoute.js";
import interventionPRoutes from "./routes/interventionPRoute.js";










dotenv.config();
const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ à sécuriser en prod
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Nouveau client connecté :", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});

startMaintenanceCron(io);

app.use(helmet());
app.use(cors());
app.use(express.json({
  limit: "10mb"
}));
app.use(rateLimit({ windowMs: 1*60*1000, max: 100 }));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/lignes", ligneRoutes);
app.use("/api/equipements", equipementRoutes);
app.use("/api/rapports", rapportInterventionRoutes);
app.use("/api/techniciens", technicienRoutes);
app.use("/api/maintenance-preventive", maintenanceRoutes);
app.use("/api/interventionP", interventionPRoutes);

app.set("io", io);


const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)

  .then(() => {
    console.log("✅ Connecté à MongoDB !");
    server.listen(PORT, ()=> console.log("Server running on port", PORT));
  })
  .catch(err => console.error("DB error", err));


 