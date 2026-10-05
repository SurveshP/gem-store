import express from "express";
import upload from "../middlewares/upload.js";

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

const router = express.Router();

// CREATE — form-data with photo file
router.post("/", upload.single("photo"), insertCustomer);

// GET ALL
router.get("/", getAllCustomers);

// GET ACTIVE ONLY
router.get("/active/all", getActiveCustomers);

// SEARCH (pehle rakhna zaroori hai :id se)
router.get("/search/data", searchCustomers);

// GET SINGLE
router.get("/:id", getCustomerById);

// UPDATE FULL — photo optional
router.post("/update/:id", upload.single("photo"), updateCustomer);

// UPDATE STATUS ONLY
router.post("/update-status/:id", updateCustomerStatus);

// DELETE
router.post("/delete/:id", deleteCustomer);

export default router;