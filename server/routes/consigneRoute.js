import express from "express";
import multer from "multer";
import path from "path";
const router = express.Router();
///const multer = require("multer");
//const path = require("path");


import { getConsignes, createConsigne, updateConsigne, deleteConsigne } from "../controllers/consigneController.js";
// Configuration stockage Multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `consigne-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// Routes API
router.get("/", getConsignes);
router.post("/", upload.single("pieceJointe"), createConsigne);
router.put("/:id", upload.single("pieceJointe"), updateConsigne);
router.delete("/:id", deleteConsigne);


export default router;