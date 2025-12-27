import express from "express";
import { getLastCompteurByEquipement } from "../controllers/compteurController.js";

const router = express.Router();

router.get("/last/:equipementId", getLastCompteurByEquipement);

export default router;
