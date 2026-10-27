import express from "express";
import { getEstimateReport, searchEstimateReport } from "../controllers/estimateReportController.js";

const router = express.Router();

// Default route (Aaj ki date ka data)
router.get("/", getEstimateReport);

// Search route (Specific date ka data)
router.get("/search", searchEstimateReport);

export default router;