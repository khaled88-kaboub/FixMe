import express from "express";
import {
  createFicheEquipement,
  getAllFichesEquipement,
  getFicheEquipementById,
  updateFicheEquipement,
  deleteFicheEquipement
} from "../controllers/ficheEquipementController.js";

const router = express.Router();

// ➕ Créer une fiche
router.post("/", createFicheEquipement);

// 📋 Récupérer toutes les fiches
router.get("/", getAllFichesEquipement);

// 🔍 Récupérer une fiche par ID
router.get("/:id", getFicheEquipementById);

// ✏️ Modifier une fiche
router.put("/:id", updateFicheEquipement);

// ❌ Supprimer une fiche
router.delete("/:id", deleteFicheEquipement);

export default router;