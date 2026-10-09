import db from "../config/db.js";
import { billingFields } from "../models/billingModel.js";

const pickBillingFields = (body) => {
    return billingFields.map((field) => body[field] ?? null);
};

// ==================== CREATE BILLING ====================
export const insertBilling = (req, res) => {
    if (!req.is("application/json")) {
        return res.status(400).json({
            success: false,
            message: "Only application/json is allowed.",
        });
    }

    const body = req.body;

    if (!body.billNo?.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: "Bill No is required",
        });
    }

    const values = pickBillingFields(body);

    const query = `
        INSERT INTO billing
        (${billingFields.join(", ")})
        VALUES (${billingFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Billing creation failed",
                error: err,
            });
        }

        const billingId = result.insertId;

        // ✅ Link items_billing rows to this billing
        // (jo bhi items is billNo ke saath hain, unka billingId update karo)
        const linkQuery = `
            UPDATE items_billing
            SET billingId = ?
            WHERE billNo = ? AND billingId IS NULL
        `;

        db.query(linkQuery, [billingId, body.billNo], (linkErr) => {
            if (linkErr) {
                console.log("Failed to link items to billing:", linkErr);
                // Billing to save ho gayi, sirf linking fail hui
                return res.status(201).json({
                    success: true,
                    message: "Billing saved, but items link failed",
                    billingId,
                });
            }

            res.status(201).json({
                success: true,
                message: "Billing saved successfully",
                billingId,
            });
        });
    });
};

// ==================== GET ALL BILLINGS ====================
export const getAllBillings = (req, res) => {
    const query = `
        SELECT * FROM billing
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch billings",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE BILLING ====================
export const getBillingById = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT * FROM billing WHERE id = ?
    `;

    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch billing",
                error: err,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Billing not found",
            });
        }

        const billing = result[0];

        // Also fetch items
        const itemsQuery = `
            SELECT * FROM items_billing
            WHERE billingId = ? AND activeStatus = 1
            ORDER BY id ASC
        `;

        db.query(itemsQuery, [id], (itemsErr, items) => {
            if (itemsErr) {
                return res.status(200).json({
                    success: true,
                    data: { ...billing, items: [] },
                });
            }

            res.status(200).json({
                success: true,
                data: { ...billing, items },
            });
        });
    });
};

// ==================== DELETE BILLING ====================
export const deleteBilling = (req, res) => {
    const { id } = req.params;

    db.query(`DELETE FROM billing WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Billing delete failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Billing not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Billing deleted successfully",
        });
    });
};

// ==================== SEARCH BILLINGS ====================
export const searchBillings = (req, res) => {
    const { search = "" } = req.query;

    const query = `
        SELECT * FROM billing
        WHERE activeStatus = 1
        AND (
            billNo LIKE ?
            OR customerName LIKE ?
            OR mobile LIKE ?
            OR billDate LIKE ?
        )
        ORDER BY id DESC
    `;

    const searchValue = `%${search}%`;

    db.query(
        query,
        [searchValue, searchValue, searchValue, searchValue],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Search failed",
                    error: err,
                });
            }

            res.status(200).json({ success: true, data: result });
        }
    );
};