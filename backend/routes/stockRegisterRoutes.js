import express from "express";
import {
    getStockSummary,
    getStockTimeline,
    getStockInOutMetalRegister
} from "../controllers/stockRegisterController.js";

const router = express.Router();

// 2. StockRegister.jsx ke liye (Tabs wala page)
router.get("/summary", getStockSummary);

// 3. StockInOutRegister.jsx ke liye (Single Date wala page)
router.get("/timeline", getStockTimeline);

// 4. StockOutRegisterGold.jsx ke liye (Gold Date Range wala page)
router.get("/metal", getStockInOutMetalRegister);

export default router;