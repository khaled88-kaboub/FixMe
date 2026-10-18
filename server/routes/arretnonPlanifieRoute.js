import express from "express";

import {
  createArretnonPlanifie,
  getArretsnonPlanifies,
  deleteArretnonPlanifie
} from "../controllers/arretnonPlanifieController.js";

const router = express.Router();

router.get("/", getArretsnonPlanifies);

router.post("/", createArretnonPlanifie);

router.delete("/:id", deleteArretnonPlanifie);

export default router;