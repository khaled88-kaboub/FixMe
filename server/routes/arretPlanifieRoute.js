import express from "express";

import {
  createArretPlanifie,
  getArretsPlanifies,
  deleteArretPlanifie
} from "../controllers/arretPlanifieController.js";

const router = express.Router();

router.get("/", getArretsPlanifies);

router.post("/", createArretPlanifie);

router.delete("/:id", deleteArretPlanifie);

export default router;