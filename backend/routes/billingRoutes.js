import express from "express";

import {
    insertBilling,
    getAllBillings,
    getBillingById,
    deleteBilling,
    searchBillings,
    getAllEstimates,
    getAllCreditList,
    getCreditListByCustomer,
    getBillingReport, //NAYA
    getTagwiseReport
} from "../controllers/billingController.js";

const router = express.Router();

// ==========================================
//SPECIAL ROUTES (Hamesha /:id se PEHLE aane chahiye)
// ==========================================

router.get("/all", getAllBillings);
router.get("/search/data", searchBillings);

// GET BILLING REPORT (Type & Date Filter)
router.get("/report", getBillingReport); //YAHAN HONA CHAHIYE

router.get("/tagwise-report", getTagwiseReport);

// GET ALL ESTIMATE
router.get("/estimates/all", getAllEstimates);

// GET ALL CREDIT LIST
router.get("/credit-list/all", getAllCreditList);

// GET CREDIT LIST BY CUSTOMER
router.get("/credit-list/customer", getCreditListByCustomer);


// ==========================================
//DYNAMIC ROUTES (Hamesha NEECHE aane chahiye)
// ==========================================

// CREATE
router.post("/create", insertBilling);

// GET SINGLE
router.get("/:id", getBillingById); //YE SABSE LAST MEIN

// DELETE
router.delete("/:id", deleteBilling);

export default router;