import db from "../config/db.js";
import { expensesFields } from "../models/expensesModel.js";
import { estimateFields } from "../models/estimateModel.js";

// Helper: body se sirf valid fields nikalna
const pickExpensesFields = (body) => {
    return expensesFields.map((field) => body[field] ?? null);
};

const pickEstimateFields = (body) => {
    return estimateFields.map((field) => body[field] ?? null);
};

// Helper: Update ke liye sirf jo fields aayi hain
const pickUpdateFields = (body) => {
    const data = {};
    expensesFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });
    return data;
};

// ==================== CREATE ====================
export const insertExpense = (req, res) => {
    if (!req.is("application/json")) {
        return res.status(400).json({
            success: false,
            message: "Only application/json is allowed.",
        });
    }

    const body = req.body;

    if (!body.date?.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: "Date is required",
        });
    }

    if ((!body.income || Number(body.income) <= 0) && (!body.expense || Number(body.expense) <= 0)) {
        return res.status(400).json({
            success: false,
            message: "Either Income or Expense amount is required",
        });
    }

    const values = pickExpensesFields(body);

    const query = `
        INSERT INTO expenses
        (${expensesFields.join(", ")})
        VALUES (${expensesFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Expense creation failed",
                error: err,
            });
        }

        const expenseId = result.insertId;

        // ✅ Estimate table mein clean data insert karo
        const estimateBody = {
            expenseId: expenseId,              // 👈 Proper Link
            billDate: body.date,
            customerName: body.remark || "Expense", // Agar customer nahi hai, toh remark hi name ki tarah dikhe
            accountNo: "N/A",
            totalFinal: 0, 
            income: body.income || 0,
            expense: body.expense || 0,
            remark: body.remark || "",
        };

        const estimateValues = pickEstimateFields(estimateBody);
        const estimateQuery = `
            INSERT INTO estimate
            (${estimateFields.join(", ")})
            VALUES (${estimateFields.map(() => "?").join(", ")})
        `;

        db.query(estimateQuery, estimateValues, (estErr) => {
            if (estErr) console.log("Estimate insert failed (Expense):", estErr);
            
            res.status(201).json({
                success: true,
                message: "Record saved successfully",
                data: { id: expenseId, ...body },
            });
        });
    });
};

// ==================== GET ALL ====================
export const getAllExpenses = (req, res) => {
    const query = `
        SELECT * FROM expenses
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch expenses",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE ====================
export const getExpenseById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT * FROM expenses WHERE id = ? AND activeStatus = 1`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch expense",
                    error: err,
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Record not found",
                });
            }

            res.status(200).json({ success: true, data: result[0] });
        }
    );
};

// ==================== SEARCH ====================
export const searchExpenses = (req, res) => {
    const { search = "" } = req.query;

    const query = `
        SELECT * FROM expenses
        WHERE activeStatus = 1
        AND (
            date LIKE ?
            OR remark LIKE ?
        )
        ORDER BY id DESC
    `;

    const searchValue = `%${search}%`;

    db.query(query, [searchValue, searchValue], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Search failed",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== UPDATE ====================
export const updateExpense = (req, res) => {
    const { id } = req.params;

    const data = pickUpdateFields(req.body);
    const keys = Object.keys(data);

    if (keys.length === 0) {
        return res.status(400).json({ success: false, message: "No fields to update" });
    }

    const query = `
        UPDATE expenses
        SET ${keys.map((k) => `${k} = ?`).join(", ")}
        WHERE id = ? AND activeStatus = 1
    `;
    const values = [...keys.map((k) => data[k]), id];

    db.query(query, values, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Update failed", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Record not found" });

        // ✅ Estimate table mein bhi update karo (expenseId se match karke)
        const estimateUpdateQuery = `
            UPDATE estimate 
            SET income = ?, expense = ?, remark = ?, billDate = ?, customerName = ?
            WHERE expenseId = ?
        `;
        
        const estValues = [
            req.body.income !== undefined ? req.body.income : 0,
            req.body.expense !== undefined ? req.body.expense : 0,
            req.body.remark || '',
            req.body.date || '',
            req.body.remark || "Expense",
            id
        ];

        db.query(estimateUpdateQuery, estValues, (estErr) => {
            if (estErr) console.log("Estimate update failed (Expense):", estErr);
            res.status(200).json({ success: true, message: "Record updated successfully", data: result });
        });
    });
};

// ==================== DELETE ====================
export const deleteExpense = (req, res) => {
    const { id } = req.params;

    db.query(`DELETE FROM expenses WHERE id = ?`, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Delete failed", error: err });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Record not found" });

        // ✅ Estimate se bhi delete karo (expenseId se match karke)
        db.query(`DELETE FROM estimate WHERE expenseId = ?`, [id], (estErr) => {
            if (estErr) console.log("Estimate delete failed:", estErr);
            res.status(200).json({ success: true, message: "Record deleted successfully" });
        });
    });
};