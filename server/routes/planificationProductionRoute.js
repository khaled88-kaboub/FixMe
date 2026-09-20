import express from "express";

import {
  createPlanification,
  getPlanifications,
  deletePlanification,
} from "../controllers/planificationProductionController.js";

const router = express.Router();

router.get("/", getPlanifications);

router.post("/", createPlanification);

router.delete("/:id", deletePlanification);

export default router;