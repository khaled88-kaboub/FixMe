import express from "express";
import { getDashboardStats, getDetailsLigne } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", getDashboardStats);
router.get("/ligne/:ligneId", getDetailsLigne);
export default router;