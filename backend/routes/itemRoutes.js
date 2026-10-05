import express from "express";

import {
    insertItem,
    getAllItems,
    getActiveItems,
    getItemById,
    updateItem,
    updateItemStatus,
    deleteItem,
    searchItems,
} from "../controllers/itemController.js";

const router = express.Router();

// CREATE — JSON only
router.post("/", insertItem);

// GET ALL
router.get("/", getAllItems);

// GET ACTIVE ONLY
router.get("/active/all", getActiveItems);

// SEARCH (pehle rakhna zaroori hai :id se)
router.get("/search/data", searchItems);

// GET SINGLE
router.get("/:id", getItemById);

// UPDATE FULL (POST + JSON)
router.post("/update/:id", updateItem);

// UPDATE STATUS ONLY (POST + JSON)
router.post("/update-status/:id", updateItemStatus);

// DELETE (POST)
router.post("/delete/:id", deleteItem);

export default router;