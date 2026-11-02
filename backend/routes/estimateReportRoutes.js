import express from "express";
import { getCreditBalanceDatewise, getEstimateReport, getPaymentDatewise, searchEstimateReport } from "../controllers/estimateReportController.js";

const router = express.Router();

// Default route (Aaj ki date ka data)
router.get("/", getEstimateReport);

// Search route (Specific date ka data)
router.get("/search", searchEstimateReport);

router.get("/payment-datewise", getPaymentDatewise);

router.get("/credit-balance-datewise", getCreditBalanceDatewise);

export default router;