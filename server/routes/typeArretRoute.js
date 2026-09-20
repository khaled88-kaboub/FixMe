import express from "express";

import {
  createTypeArret,
  getTypesArret
} from "../controllers/typeArretController.js";

const router = express.Router();

router.get("/", getTypesArret);

router.post("/", createTypeArret);

export default router;