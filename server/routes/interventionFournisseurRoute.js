import express from "express";
import {
  createInterventionFournisseur,
  uploadRapport,
  getInterventionsFournisseur,
  updateInterventionFournisseur,
  deleteInterventionFournisseur,
} from "../controllers/interventionFournisseurController.js";

import uploadRapportIntervention from "../middleware/uploadRapportIntervention.js";

const router = express.Router();

router.get("/", getInterventionsFournisseur);

router.post(
  "/",
  uploadRapportIntervention.single("rapport"),
  createInterventionFournisseur
);


router.put(
  "/:id",
  uploadRapportIntervention.single("rapport"),
  updateInterventionFournisseur
);

router.delete("/:id", deleteInterventionFournisseur);
export default router;
