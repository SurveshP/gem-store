import express from "express";

import {
    insertItemsBilling,
    getItemsByBill,
    getAllItemsBilling,
    deleteItemsBilling,
    getNextBillNo,
} from "../controllers/itemsBillingController.js";

const router = express.Router();

// Next bill no
router.get("/nextBillNo/:billType", getNextBillNo);

// CREATE
router.post("/create", insertItemsBilling);

// GET ALL (for billing details page)
router.get("/all", getAllItemsBilling);

// GET ITEMS BY BILL NO
router.get("/by-bill/:billNo", getItemsByBill);

// DELETE
router.delete("/:id", deleteItemsBilling);

export default router;