import db from "../config/db.js";
import { creditPaymentFields } from "../models/creditPaymentModel.js";

const pickCreditPaymentFields = (body) => {
    return creditPaymentFields.map((field) => body[field] ?? null);
};

const pickUpdateFields = (body) => {
    const data = {};
    creditPaymentFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });
    return data;
};

// ==================== CREATE ====================
export const insertCreditPayment = (req, res) => {
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
            message: "Client name is required",
        });
    }

    if (!body.pay || Number(body.pay) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Pay amount is required",
        });
    }

    const values = pickCreditPaymentFields(body);

    const query = `
        INSERT INTO credit_payment
        (${creditPaymentFields.join(", ")})
        VALUES (${creditPaymentFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Credit payment creation failed",
                error: err,
            });
        }

        // ✅ Ab credit_list mein update karo
        updateCreditList(body, (updateErr, updateResult) => {
            if (updateErr) {
                console.log("Credit List update failed:", updateErr);
                // Payment to save ho gaya, sirf credit list update fail hui
                return res.status(201).json({
                    success: true,
                    message: "Payment saved but credit list update failed",
                    data: { id: result.insertId, ...body },
                });
            }

            res.status(201).json({
                success: true,
                message: "Payment saved successfully",
                data: { id: result.insertId, ...body },
                creditListUpdated: updateResult,
            });
        });
    });
};

// ==================== UPDATE CREDIT LIST ====================
const updateCreditList = (paymentBody, callback) => {
    const {
        accountNo,
        clientName,
        mobile,
        pay,
        addition,
        dueDate,
    } = paymentBody;

    // Credit List fetch karo us customer ke liye
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

        const payAmount = parseFloat(pay) || 0;
        const additionAmount = parseFloat(addition) || 0;

        const newCash = (parseFloat(creditList.cash) || 0) + payAmount;
        const newBalance =
            (parseFloat(creditList.finalBalance) || 0) - additionAmount;

        const finalBalance = newBalance < 0 ? 0 : newBalance;

        const updateQuery = `
            UPDATE credit_list
            SET
                cash = ?,
                finalBalance = ?,
                nextDate = ?
            WHERE id = ?
        `;

        db.query(
            updateQuery,
            [
                newCash.toFixed(2),
                finalBalance.toFixed(2),
                dueDate || creditList.nextDate,
                creditList.id,
            ],
            (updateErr, updateResult) => {
                if (updateErr) {
                    return callback(updateErr);
                }

                callback(null, {
                    updated: true,
                    creditListId: creditList.id,
                    oldCash: creditList.cash,
                    newCash: newCash.toFixed(2),
                    oldBalance: creditList.finalBalance,
                    newBalance: finalBalance.toFixed(2),
                });
            }
        );
    });
};

// ==================== GET ALL ====================
export const getAllCreditPayments = (req, res) => {
    const query = `
        SELECT * FROM credit_payment
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch credit payments",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET BY CUSTOMER ====================
export const getPaymentsByCustomer = (req, res) => {
    const { accountNo = "", clientName = "" } = req.query;

    if (!accountNo && !clientName) {
        return res.status(400).json({
            success: false,
            message: "accountNo or clientName is required",
        });
    }

    const query = `
        SELECT * FROM credit_payment
        WHERE activeStatus = 1
        AND (accountNo = ? OR clientName = ?)
        ORDER BY id DESC
    `;

    db.query(query, [accountNo, clientName], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch credit payments",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE ====================
export const getCreditPaymentById = (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT * FROM credit_payment WHERE id = ?`,
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch credit payment",
                    error: err,
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Credit payment not found",
                });
            }

            res.status(200).json({ success: true, data: result[0] });
        }
    );
};

// ==================== UPDATE ====================
export const updateCreditPayment = (req, res) => {
    const { id } = req.params;
    const data = pickUpdateFields(req.body);
    const keys = Object.keys(data);

    if (keys.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No fields to update",
        });
    }

    const query = `
        UPDATE credit_payment
        SET ${keys.map((k) => `${k} = ?`).join(", ")}
        WHERE id = ?
    `;

    const values = [...keys.map((k) => data[k]), id];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Credit payment update failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Credit payment not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Credit payment updated successfully",
            data: result,
        });
    });
};

// ==================== DELETE ====================
export const deleteCreditPayment = (req, res) => {
    const { id } = req.params;

    // Pehle payment fetch karo (reverse ke liye)
    db.query(
        `SELECT * FROM credit_payment WHERE id = ?`,
        [id],
        (fetchErr, rows) => {
            if (fetchErr || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Credit payment not found",
                });
            }

            const payment = rows[0];

            // Ab delete karo
            db.query(
                `DELETE FROM credit_payment WHERE id = ?`,
                [id],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Delete failed",
                            error: err,
                        });
                    }

                    // ✅ Credit List mein reverse update karo
                    reverseCreditList(payment, () => {
                        res.status(200).json({
                            success: true,
                            message: "Payment deleted and credit list updated",
                        });
                    });
                }
            );
        }
    );
};

// ==================== REVERSE CREDIT LIST ====================
const reverseCreditList = (payment, callback) => {
    const { accountNo, clientName, mobile, pay, addition } = payment;

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
            console.log("No credit list found for reverse");
            return callback();
        }

        const creditList = rows[0];

        const payAmount = parseFloat(pay) || 0;
        const additionAmount = parseFloat(addition) || 0;

        const newCash = (parseFloat(creditList.cash) || 0) - payAmount;
        const newBalance =
            (parseFloat(creditList.finalBalance) || 0) + additionAmount;

        const updateQuery = `
            UPDATE credit_list
            SET
                cash = ?,
                finalBalance = ?
            WHERE id = ?
        `;

        db.query(
            updateQuery,
            [
                (newCash < 0 ? 0 : newCash).toFixed(2),
                newBalance.toFixed(2),
                creditList.id,
            ],
            (updateErr) => {
                if (updateErr) {
                    console.log("Reverse update failed:", updateErr);
                }
                callback();
            }
        );
    });
};