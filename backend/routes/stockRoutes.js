import express from "express";

import {
    insertStock,
    getAllStocks,
    getActiveStocks,
    getStockById,
    updateStock,
    updateStockStatus,
    deleteStock,
    searchStocks,
    getNextBillNo,
    getLastTag,
    getStockGroupHistory,
} from "../controllers/stockController.js";

const router = express.Router();

// ============ SPECIAL ROUTES (must come before /:id) ============

// Next bill no (auto-generate ke liye)
router.get("/next-bill-no", getNextBillNo);

// Last tag (item + types ke hisaab se)
router.get("/last-tag", getLastTag);

// Active list (frontend use kar raha hai)
router.get("/active/all", getActiveStocks);

// Search
router.get("/search/data", searchStocks);

// ============ CRUD ============

// CREATE
router.post("/", insertStock);

// GET ALL
router.get("/", getAllStocks);

// History (must come before /:id)
router.get("/group-history/:stockId", getStockGroupHistory);

// GET SINGLE (last mein rakhna zaroori hai)
router.get("/:id", getStockById);

// UPDATE FULL
router.put("/:id", updateStock);

// UPDATE STATUS ONLY (frontend PATCH use kar raha hai)
router.patch("/status/:id", updateStockStatus);

// DELETE
router.delete("/:id", deleteStock);

export default router;