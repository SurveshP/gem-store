import db from "../config/db.js";
import { creditSaleFields } from "../models/creditSaleModel.js";

const pickCreditSaleFields = (body) => {
    return creditSaleFields.map((field) => body[field] ?? null);
};

// ==================== GET ALL CREDIT SALES ====================
export const getAllCreditSales = (req, res) => {
    const query = `
        SELECT * FROM credit_sale
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch credit sales",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET BY CUSTOMER ====================
export const getCreditSalesByCustomer = (req, res) => {
    const { customerName = "", mobile = "" } = req.query;

    if (!customerName && !mobile) {
        return res.status(400).json({
            success: false,
            message: "customerName or mobile is required",
        });
    }

    const query = `
        SELECT * FROM credit_sale
        WHERE activeStatus = 1
        AND (
            clientName = ?
            OR mobile = ?
        )
        ORDER BY id DESC
    `;

    db.query(query, [customerName, mobile], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch credit sales",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE ====================
export const getCreditSaleById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT * FROM credit_sale WHERE id = ?`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch credit sale",
                    error: err,
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Credit sale not found",
                });
            }

            res.status(200).json({ success: true, data: result[0] });
        }
    );
};

// ==================== CREATE (manual) ====================
export const insertCreditSale = (req, res) => {
    if (!req.is("application/json")) {
        return res.status(400).json({
            success: false,
            message: "Only application/json is allowed.",
        });
    }

    const body = req.body;

    if (!body.clientName?.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: "Client Name is required",
        });
    }

    const values = pickCreditSaleFields(body);

    const query = `
        INSERT INTO credit_sale
        (${creditSaleFields.join(", ")})
        VALUES (${creditSaleFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Credit sale creation failed",
                error: err,
            });
        }

        res.status(201).json({
            success: true,
            message: "Credit sale saved successfully",
            data: { id: result.insertId, ...body },
        });
    });
};

// ==================== DELETE ====================
export const deleteCreditSale = (req, res) => {
    const { id } = req.params;

    db.query(
        `DELETE FROM credit_sale WHERE id = ?`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Delete failed",
                    error: err,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Credit sale not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Credit sale deleted successfully",
            });
        }
    );
};