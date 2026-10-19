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

        const creditSaleId = result.insertId;

        //Ab CreditList update karo
        updateCreditList(body, (clErr, clResult) => {
            if (clErr) {
                console.log("CreditList update failed:", clErr);
            }

            res.status(201).json({
                success: true,
                message: "Credit sale saved successfully",
                data: { id: creditSaleId, ...body },
                creditListUpdated: clResult,
            });
        });
    });
};

// ==================== UPDATE CREDIT LIST (PLUS) ====================
const updateCreditList = (saleBody, callback) => {
    const {
        accountNo,
        clientName,
        mobile,
        finalAmount,
        cash,
        oldGold,
        finalBalance,
    } = saleBody;

    const findQuery = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND (
            (accountNo = ? AND accountNo IS NOT NULL AND accountNo != '')
            OR (mobile = ? AND mobile IS NOT NULL AND mobile != '')
            OR clientName = ?
        )
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(findQuery, [accountNo, mobile, clientName], (findErr, rows) => {
        if (findErr) {
            return callback(findErr);
        }

        if (rows.length === 0) {
            return callback(null, {
                updated: false,
                message: "No matching credit list found",
            });
        }

        const creditList = rows[0];

        const addFinalAmount = parseFloat(finalAmount) || 0;
        const addCash = parseFloat(cash) || 0;
        const addOldGold = parseFloat(oldGold) || 0;
        const addBalance = parseFloat(finalBalance) || 0;

        //PURANI value + NAYI value (PLUS)
        const newFinalAmount =
            (parseFloat(creditList.finalAmount) || 0) + addFinalAmount;
        const newCash = (parseFloat(creditList.cash) || 0) + addCash;
        const newOldGold =
            (parseFloat(creditList.oldGold) || 0) + addOldGold;
        const newFinalBalance =
            (parseFloat(creditList.finalBalance) || 0) + addBalance;

        const updateQuery = `
            UPDATE credit_list
            SET
                finalAmount = ?,
                cash = ?,
                oldGold = ?,
                finalBalance = ?
            WHERE id = ?
        `;

        db.query(
            updateQuery,
            [
                newFinalAmount.toFixed(2),
                newCash.toFixed(2),
                newOldGold.toFixed(2),
                newFinalBalance.toFixed(2),
                creditList.id,
            ],
            (updateErr) => {
                if (updateErr) {
                    return callback(updateErr);
                }

                callback(null, {
                    updated: true,
                    creditListId: creditList.id,
                    oldFinalAmount: creditList.finalAmount,
                    newFinalAmount: newFinalAmount.toFixed(2),
                    oldCash: creditList.cash,
                    newCash: newCash.toFixed(2),
                    oldOldGold: creditList.oldGold,
                    newOldGold: newOldGold.toFixed(2),
                    oldFinalBalance: creditList.finalBalance,
                    newFinalBalance: newFinalBalance.toFixed(2),
                });
            }
        );
    });
};

// ==================== DELETE (REVERSE) ====================
export const deleteCreditSale = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT * FROM credit_sale WHERE id = ?`,
        [id],
        (fetchErr, rows) => {
            if (fetchErr || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Credit sale not found",
                });
            }

            const creditSale = rows[0];

            db.query(
                `DELETE FROM credit_sale WHERE id = ?`,
                [id],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Delete failed",
                            error: err,
                        });
                    }

                    //CreditList reverse update
                    reverseCreditList(creditSale, () => {
                        res.status(200).json({
                            success: true,
                            message:
                                "Credit sale deleted & credit list reversed",
                        });
                    });
                }
            );
        }
    );
};

// ==================== REVERSE CREDIT LIST ====================
const reverseCreditList = (creditSale, callback) => {
    const {
        accountNo,
        clientName,
        mobile,
        finalAmount,
        cash,
        oldGold,
        finalBalance,
    } = creditSale;

    const findQuery = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND (
            (accountNo = ? AND accountNo IS NOT NULL AND accountNo != '')
            OR (mobile = ? AND mobile IS NOT NULL AND mobile != '')
            OR clientName = ?
        )
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(findQuery, [accountNo, mobile, clientName], (findErr, rows) => {
        if (findErr || rows.length === 0) {
            return callback();
        }

        const creditList = rows[0];

        const subFinalAmount = parseFloat(finalAmount) || 0;
        const subCash = parseFloat(cash) || 0;
        const subOldGold = parseFloat(oldGold) || 0;
        const subBalance = parseFloat(finalBalance) || 0;

        // PURANI value - NAYI value (MINUS)
        const newFinalAmount =
            (parseFloat(creditList.finalAmount) || 0) - subFinalAmount;
        const newCash = (parseFloat(creditList.cash) || 0) - subCash;
        const newOldGold =
            (parseFloat(creditList.oldGold) || 0) - subOldGold;
        const newFinalBalance =
            (parseFloat(creditList.finalBalance) || 0) - subBalance;

        const updateQuery = `
            UPDATE credit_list
            SET
                finalAmount = ?,
                cash = ?,
                oldGold = ?,
                finalBalance = ?
            WHERE id = ?
        `;

        db.query(
            updateQuery,
            [
                (newFinalAmount < 0 ? 0 : newFinalAmount).toFixed(2),
                (newCash < 0 ? 0 : newCash).toFixed(2),
                (newOldGold < 0 ? 0 : newOldGold).toFixed(2),
                (newFinalBalance < 0 ? 0 : newFinalBalance).toFixed(2),
                creditList.id,
            ],
            (updateErr) => {
                if (updateErr) {
                    console.log("Reverse credit_list failed:", updateErr);
                }
                callback();
            }
        );
    });
};