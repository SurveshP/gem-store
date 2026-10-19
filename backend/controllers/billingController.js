import db from "../config/db.js";
import { billingFields } from "../models/billingModel.js";
import { estimateFields } from "../models/estimateModel.js";
import { creditListFields } from "../models/creditListModel.js";

const pickBillingFields = (body) => {
    return billingFields.map((field) => body[field] ?? null);
};

const pickEstimateFields = (body) => {
    return estimateFields.map((field) => body[field] ?? null);
};

const pickCreditListFields = (body) => {
    return creditListFields.map((field) => body[field] ?? null);
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

    // ============ STEP 1: Billing insert ============
    const billingValues = pickBillingFields(body);

    const billingQuery = `
        INSERT INTO billing
        (${billingFields.join(", ")})
        VALUES (${billingFields.map(() => "?").join(", ")})
    `;

    db.query(billingQuery, billingValues, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Billing creation failed",
                error: err,
            });
        }

        const billingId = result.insertId;

        // ============ STEP 2: Link items_billing ============
        const linkQuery = `
            UPDATE items_billing
            SET billingId = ?
            WHERE billNo = ? AND billingId IS NULL
        `;

        db.query(linkQuery, [billingId, body.billNo], (linkErr) => {
            if (linkErr) {
                console.log("Failed to link items to billing:", linkErr);
            }

            // ============ STEP 3: Estimate insert ============
            insertEstimate(billingId, body, () => {

                // ============ STEP 4: Credit List insert ============
                insertCreditList(billingId, body, () => {

                    // ============ FINAL RESPONSE ============
                    res.status(201).json({
                        success: true,
                        message: "Billing saved successfully",
                        billingId,
                    });
                });
            });
        });
    });
};

// ==================== INSERT ESTIMATE ====================
const insertEstimate = (billingId, billingData, callback) => {
    const estimateBody = {
        billingId,
        billNo: billingData.billNo,
        billDate: billingData.billDate,
        customerName: billingData.customerName,
        accountNo: billingData.accountNo,
        amount: billingData.finalAmount,
        pay: billingData.cash,
        oldGold: billingData.oldGold,
        textSwapOnline: billingData.online,
        round: billingData.roundAmount,
        balance: billingData.balance,
        dueDate: billingData.dueDate,
        additionAll: billingData.additionAll,
        totalFinal: billingData.finalTotal,
    };

    const estimateValues = pickEstimateFields(estimateBody);

    const insertQuery = `
        INSERT INTO estimate
        (${estimateFields.join(", ")})
        VALUES (${estimateFields.map(() => "?").join(", ")})
    `;

    db.query(insertQuery, estimateValues, (insertErr) => {
        if (insertErr) {
            console.log("Estimate insert failed:", insertErr);
        }
        callback();
    });
};

// ==================== INSERT CREDIT LIST ====================
const insertCreditList = (billingId, billingData, callback) => {
    const creditListBody = {
        billingId,
        billNo: billingData.billNo,
        clientName: billingData.customerName,
        accountNo: billingData.accountNo,
        billDate: billingData.billDate,
        finalAmount: billingData.finalAmount,
        cash: billingData.cash,
        oldGold: billingData.oldGold,
        finalBalance: billingData.balance,
        nextDate: billingData.dueDate,
        remark: billingData.remarks,
        mobile: billingData.mobile,
        referredBy: billingData.referredBy,
    };

    const creditListValues = pickCreditListFields(creditListBody);

    const insertQuery = `
        INSERT INTO credit_list
        (${creditListFields.join(", ")})
        VALUES (${creditListFields.map(() => "?").join(", ")})
    `;

    db.query(insertQuery, creditListValues, (insertErr) => {
        if (insertErr) {
            console.log("Credit List insert failed:", insertErr);
        }
        callback();
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

    const query = `SELECT * FROM billing WHERE id = ?`;

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

// ==================== GET ALL ESTIMATES ====================
export const getAllEstimates = (req, res) => {
    const query = `
        SELECT * FROM estimate
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch estimates",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET ALL CREDIT LIST ====================
export const getAllCreditList = (req, res) => {
    const query = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch credit list",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET CREDIT LIST BY CUSTOMER ====================
export const getCreditListByCustomer = (req, res) => {
    const { customerName = "", mobile = "" } = req.query;

    const query = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND (clientName = ? OR mobile = ?)
        ORDER BY id DESC
    `;

    db.query(query, [customerName, mobile], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch credit list",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
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

        // Estimate + Credit List bhi delete karo
        db.query(`DELETE FROM estimate WHERE billingId = ?`, [id], () => {});
        db.query(`DELETE FROM credit_list WHERE billingId = ?`, [id], () => {});

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