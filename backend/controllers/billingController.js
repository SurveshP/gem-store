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
        db.query(`DELETE FROM estimate WHERE billingId = ?`, [id], () => { });
        db.query(`DELETE FROM credit_list WHERE billingId = ?`, [id], () => { });

        res.status(200).json({
            success: true,
            message: "Billing deleted successfully",
        });
    });
};

// ==================== SEARCH BILLINGS ====================
export const searchBillings = (req, res) => {
    const { search = "" } = req.query;
    const searchValue = `%${search}%`;

    //Ab sirf accountNo, billNo, aur customerName se search hoga
    const query = `
        SELECT * FROM billing
        WHERE activeStatus = 1
        AND (
            billNo LIKE ?
            OR customerName LIKE ?
            OR accountNo LIKE ?
        )
        ORDER BY id DESC
    `;

    db.query(
        query,
        [searchValue, searchValue, searchValue],
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

// ==================== GET BILLING REPORT (Type & Date Range) ====================
export const getBillingReport = (req, res) => {
    const { billType = "", dateFrom = "", dateTo = "" } = req.query;

    // Base query
    let query = `
        SELECT * FROM billing
        WHERE activeStatus = 1
    `;
    const params = [];

    // Filter by Bill Type (agar select kiya hai)
    if (billType.trim()) {
        query += ` AND billType = ?`;
        params.push(billType.trim());
    }

    // Filter by Date Range (agar diya hai)
    if (dateFrom && dateTo) {
        // Frontend se YYYY-MM-DD aata hai, use convert karna padega agar DB me DD-MM-YYYY hai.
        // Maan lijiye DB me date 'YYYY-MM-DD' format me hi hai. Agar DD-MM-YYYY hai to convert karein.
        const convertToDDMMYYYY = (d) => {
            const parts = d.split('-');
            return `${parts[2]}-${parts[1]}-${parts[0]}`; // Yahan '-' ya '/' apne DB ke hisaab se rakhein
        };

        // NOTE: Agar aapke DB me billDate VARCHAR(20) 'YYYY-MM-DD' me hai toh direct bhejenge, 
        // warna convertToDDMMYYYY(dateFrom) karke bhejenge. Filhal hum YYYY-MM-DD hi bhej rahe hain.
        query += ` AND billDate BETWEEN ? AND ?`;
        params.push(dateFrom, dateTo);
    } else if (dateFrom) {
        query += ` AND billDate >= ?`;
        params.push(dateFrom);
    } else if (dateTo) {
        query += ` AND billDate <= ?`;
        params.push(dateTo);
    }

    query += ` ORDER BY id DESC`;

    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch billing report",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET TAGWISE REPORT (Date Range) ====================
export const getTagwiseReport = (req, res) => {
    const { dateFrom = "", dateTo = "" } = req.query;

    if (!dateFrom || !dateTo) {
        return res.status(400).json({
            success: false,
            message: "Both Date From and Date To are required",
        });
    }

    // Hum dono format (DD-MM-YYYY aur YYYY-MM-DD) try karenge
    const convertToYYYYMMDD = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            // Input is DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    const formattedFrom_DMY = dateFrom;
    const formattedTo_DMY = dateTo;
    const formattedFrom_YMD = convertToYYYYMMDD(dateFrom);
    const formattedTo_YMD = convertToYYYYMMDD(dateTo);

    // ✅ Query mein LEFT JOIN use kiya taaki link miss ho toh bhi items aayen
    // Aur Date check mein dono formats allow kiye hain
    const query = `
        SELECT 
            b.billDate AS date,
            b.customerName AS clientName,
            b.mobile AS mobile,
            ib.amount AS amount,
            ib.tagNo AS tagNo,
            ib.weight AS weight,
            ib.amount AS rate, 
            ib.makingAmount AS making,
            ib.totalAmount AS total
        FROM items_billing ib
        LEFT JOIN billing b ON ib.billNo = b.billNo
        WHERE b.activeStatus = 1 
        AND (
            (b.billDate BETWEEN ? AND ?) 
            OR 
            (b.billDate BETWEEN ? AND ?)
        )
        ORDER BY b.id DESC, ib.id ASC
    `;

    db.query(query, [formattedFrom_DMY, formattedTo_DMY, formattedFrom_YMD, formattedTo_YMD], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        // Agar upar wale logic se data nahi mila, toh ek baar check karein ki data exists karta hai ya nahi
        if (result.length === 0) {
            // Fallback query: Bina date filter ke check karo ki items_billing mein data hai ya nahi
            const checkQuery = `SELECT COUNT(*) as count FROM items_billing`;
            db.query(checkQuery, (checkErr, checkRes) => {
                if (!checkErr && checkRes[0].count > 0) {
                    console.log("Items table has data, but date filter or join failed. Check dates in DB.");
                }
            });
        }

        const totalAmount = result.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

        res.status(200).json({
            success: true,
            data: result,
            summary: { totalRecord: result.length, totalAmount }
        });
    });
};