import express from "express";
import {
    getAllCreditList,
    getCreditListAbove25K,
    getCreditListByCustomer,
    getCreditListDatewise
} from "../controllers/creditListController.js";

const router = express.Router();

router.get("/all", getAllCreditList);
router.get("/customer", getCreditListByCustomer);
router.get("/datewise", getCreditListDatewise);
router.get("/above25k", getCreditListAbove25K);

export default router;