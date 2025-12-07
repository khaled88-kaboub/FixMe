import express from "express";
import {
  createEquipement,
  getEquipements,
  getEquipementById,
  updateEquipement,
  deleteEquipement,
} from "../controllers/equipementController.js";

const router = express.Router();

router.post("/", createEquipement);
router.get("/", getEquipements);
router.get("/:id", getEquipementById);
router.put("/:id", updateEquipement);
router.delete("/:id", deleteEquipement);

export default router;
