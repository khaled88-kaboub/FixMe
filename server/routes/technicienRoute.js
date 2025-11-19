import express from "express";
import {
  createTechnicien,
  getTechniciens,
  getTechnicienById,
  updateTechnicien,
  deleteTechnicien
} from "../controllers/technicienController.js";

const router = express.Router();

// ➕ Ajouter un technicien
router.post("/", createTechnicien);

// 📋 Liste de tous les techniciens
router.get("/", getTechniciens);

// 🔍 Recherche par nom ou spécialité
router.get("/:id", getTechnicienById);

// 📝 Mise à jour
router.put("/:id", updateTechnicien);

// 🗑️ Suppression
router.delete("/:id", deleteTechnicien);

export default router;
