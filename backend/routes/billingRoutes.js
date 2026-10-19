import express from "express";

import {
    insertBilling,
    getAllBillings,
    getBillingById,
    deleteBilling,
    searchBillings,
    getAllEstimates,
    getAllCreditList,              // 👈 NAYA
    getCreditListByCustomer,       // 👈 NAYA
} from "../controllers/billingController.js";

const router = express.Router();

// Special routes (before /:id)
router.get("/all", getAllBillings);
router.get("/search/data", searchBillings);

// CREATE
router.post("/create", insertBilling);

// GET ALL ESTIMATE
router.get("/estimates/all", getAllEstimates);

// GET ALL CREDIT LIST
router.get("/credit-list/all", getAllCreditList);                  // 👈 NAYA

// GET CREDIT LIST BY CUSTOMER
router.get("/credit-list/customer", getCreditListByCustomer);      // 👈 NAYA

// GET SINGLE
router.get("/:id", getBillingById);

// DELETE
router.delete("/:id", deleteBilling);

export default router;