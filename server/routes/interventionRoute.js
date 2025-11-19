// routes/intervention.js
import express from "express";
import {
  createIntervention,
  getAllInterventions,
  getInterventionById,
  updateIntervention,
  deleteIntervention,
} from "../controllers/InterventionController.js";
//import { protect } from "../middleware/authMiddleware.js"; // si tu veux sécuriser

const router = express.Router();

router.post("/", createIntervention);
router.get("/", getAllInterventions);
router.get("/:id", getInterventionById);
router.put("/:id",  updateIntervention);
router.delete("/:id",  deleteIntervention);

export default router;
