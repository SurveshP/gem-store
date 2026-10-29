import express from "express";
import {
    getAllCreditList,
    getCreditListByCustomer
} from "../controllers/creditListController.js";

const router = express.Router();

router.get("/all", getAllCreditList);
router.get("/customer", getCreditListByCustomer);

export default router;