import express from "express";
// import upload from "../middleware/upload.js";

import {
    insertCustomer,
    getAllCustomers,
    getActiveCustomers,
    getCustomerById,
    updateCustomer,
    updateCustomerStatus,
    deleteCustomer,
    searchCustomers,
} from "../controllers/customerController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// CREATE  (form-data — photo field bhi aa sakta hai)
router.post("/", upload.single("photo"), insertCustomer);

// GET ALL
router.get("/", getAllCustomers);

// GET ACTIVE ONLY
router.get("/active/all", getActiveCustomers);

// SEARCH (pehle rakhna zaroori hai)
router.get("/search/data", searchCustomers);

// GET SINGLE
router.get("/:id", getCustomerById);

// UPDATE FULL CUSTOMER (form-data)
router.post("/update/:id", upload.single("photo"), updateCustomer);

// UPDATE STATUS ONLY (POST — JSON chalega, file nahi)
router.post("/update-status/:id", updateCustomerStatus);

// DELETE (POST)
router.post("/delete/:id", deleteCustomer);

export default router;