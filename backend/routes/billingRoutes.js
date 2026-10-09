import express from "express";

import {
    insertBilling,
    getAllBillings,
    getBillingById,
    deleteBilling,
    searchBillings,
} from "../controllers/billingController.js";

const router = express.Router();

// Special routes (before /:id)
router.get("/all", getAllBillings);
router.get("/search/data", searchBillings);

// CREATE
router.post("/create", insertBilling);

// GET SINGLE
router.get("/:id", getBillingById);

// DELETE
router.delete("/:id", deleteBilling);

export default router;