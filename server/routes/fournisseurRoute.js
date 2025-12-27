import express from "express";
import uploadContrat from "../middleware/uploadContrat.js";
import {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur,
  uploadContratMaintenance,
  supprimerContratMaintenance,
} from "../controllers/fournisseurController.js";

const router = express.Router();

router.post("/", createFournisseur);
router.get("/", getFournisseurs);
router.get("/:id", getFournisseurById);
router.put("/:id", updateFournisseur);
router.delete("/:id", deleteFournisseur);


// Upload contrat maintenance
router.post(
  "/:id/contrat",
  uploadContrat.single("contrat"),
  uploadContratMaintenance
);

// Delete contrat maintenance
router.delete(
  "/:id/contrat",
  supprimerContratMaintenance
);


export default router;
