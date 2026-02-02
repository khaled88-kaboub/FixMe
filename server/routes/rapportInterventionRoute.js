import express from "express";
import {
  createRapport,
  getAllRapports,
  getRapportById,
  updateRapport,
  deleteRapport,
  getTotalDuree,
  getRapportsByInterventionId
} from "../controllers/rapportInterventionController.js";

const router = express.Router();

router.post("/", createRapport);          // ➕ Créer
router.get("/", getAllRapports);          // 📋 Liste
router.get("/intervention/:interventionId", getRapportsByInterventionId);
router.get("/:id", getRapportById);       // 🔍 Détail
router.put("/:id", updateRapport);        // ✏️ Modifier
router.delete("/:id", deleteRapport);     // ❌ Supprimer
router.get("/:id/duree", getTotalDuree);  // ⏱️ Durée totale


export default router;

