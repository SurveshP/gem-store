import express from "express";

import {
    insertExpense,
    getAllExpenses,
    getExpenseById,
    searchExpenses,
    updateExpense,
    deleteExpense,
} from "../controllers/expensesController.js";

const router = express.Router();

// Special routes (before /:id)
router.get("/search", searchExpenses);

// CRUD Routes
router.post("/create", insertExpense);
router.get("/", getAllExpenses);        // GET All
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;