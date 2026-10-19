import express from "express";

import {
    getAllCreditSales,
    getCreditSalesByCustomer,
    getCreditSaleById,
    insertCreditSale,
    deleteCreditSale,
} from "../controllers/creditSaleController.js";

const router = express.Router();

// Special routes (before /:id)
router.get("/all", getAllCreditSales);
router.get("/customer", getCreditSalesByCustomer);

// CREATE
router.post("/create", insertCreditSale);

// GET SINGLE
router.get("/:id", getCreditSaleById);

// DELETE
router.delete("/:id", deleteCreditSale);

export default router;