import express from "express";

import {
    insertCreditPayment,
    getAllCreditPayments,
    getPaymentsByCustomer,
    getCreditPaymentById,
    updateCreditPayment,
    deleteCreditPayment,
} from "../controllers/creditPaymentController.js";

const router = express.Router();

// Special routes (before /:id)
router.get("/all", getAllCreditPayments);
router.get("/customer", getPaymentsByCustomer);

// CREATE
router.post("/create", insertCreditPayment);

// GET SINGLE
router.get("/:id", getCreditPaymentById);

// UPDATE
router.put("/:id", updateCreditPayment);

// DELETE
router.delete("/:id", deleteCreditPayment);

export default router;