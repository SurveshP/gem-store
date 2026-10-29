import express from "express";
import {
    getAllCreditList,
    getCreditListByCustomer,
    getCreditListDatewise
} from "../controllers/creditListController.js";

const router = express.Router();

router.get("/all", getAllCreditList);
router.get("/customer", getCreditListByCustomer);
router.get("/datewise", getCreditListDatewise);

export default router;