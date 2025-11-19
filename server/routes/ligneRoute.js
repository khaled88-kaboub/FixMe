import express from "express";
import { getLignes, addLigne, deleteLigne, updateLigne } from "../controllers/ligneController.js";

const router = express.Router();

router.get("/", getLignes);
router.post("/", addLigne);
router.put("/:id", updateLigne);
router.delete("/:id", deleteLigne);


export default router;
