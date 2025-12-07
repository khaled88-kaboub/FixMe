import express from "express";
import {
  getInterventionsP,
  getInterventionP,
  createInterventionP,
  updateInterventionP,
  deleteInterventionP
} from "../controllers/interventionPController.js";

const router = express.Router();

// Liste
router.get("/", getInterventionsP);

// Une seule
router.get("/:id", getInterventionP);

// Créer
router.post("/", createInterventionP);

// Modifier
router.put("/:id", updateInterventionP);

// Supprimer
router.delete("/:id", deleteInterventionP);

export default router;
