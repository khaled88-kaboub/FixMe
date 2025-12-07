// routes/maintenancePreventiveRoutes.js
import express from "express";
import {
  createMP,
  getAllMP,
  getMPById,
  updateMP,
  deleteMP,
  markAsDone,
  getMPForCalendar
} from "../controllers/maintenancePreventiveController.js";

const router = express.Router();
router.get("/calendar", getMPForCalendar);
// CRUD
router.post("/", createMP);           // créer
router.get("/", getAllMP);            // lister (avec filtres)
router.get("/:id", getMPById);        // détail
router.put("/:id", updateMP);         // modifier
router.delete("/:id", deleteMP);      // supprimer



// action spécifique
router.post("/:id/done", markAsDone); // marquer comme réalisé (push historique + recalc prochaine)

export default router;
