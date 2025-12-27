import express from "express";
import {
  addReleveCompteur,
  getRelevesByEquipement,
  getAllReleves,
  updateReleveCompteur,
  deleteReleveCompteur,
  getLastCompteurByEquipement
} from "../controllers/compteurHoraireController.js";

// (optionnel mais conseillé)
// import auth from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/compteurs
 * @desc    Ajouter un relevé compteur
 */
router.post("/", addReleveCompteur);

/**
 * @route   GET /api/compteurs
 * @desc    Liste de tous les relevés (tableau UI)
 */
router.get("/", getAllReleves);

/**
 * @route   GET /api/compteurs/equipement/:equipementId
 * @desc    Historique des relevés par équipement
 */
router.get("/equipement/:equipementId", getRelevesByEquipement);

/**
 * @route   PUT /api/compteurs/:id
 * @desc    Mise à jour d’un relevé
 */
router.put("/:id", updateReleveCompteur);

/**
 * @route   DELETE /api/compteurs/:id
 * @desc    Suppression d’un relevé
 */
router.delete("/:id", deleteReleveCompteur);

// routes/compteurRoutes.js
router.get("/last/:equipementId", getLastCompteurByEquipement);

export default router;


