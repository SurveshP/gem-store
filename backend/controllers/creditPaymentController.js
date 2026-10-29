import db from "../config/db.js";
import { creditPaymentFields } from "../models/creditPaymentModel.js";
import { estimateFields } from "../models/estimateModel.js";

const pickCreditPaymentFields = (body) => {
    return creditPaymentFields.map((field) => body[field] ?? null);
};

const pickEstimateFields = (body) => {
    return estimateFields.map((field) => body[field] ?? null);
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

        const paymentId = result.insertId;

        // Step 1: credit_list update karo
        updateCreditList(body, (clErr, clResult) => {
            if (clErr) console.log("Credit List update failed:", clErr);

            // Step 2: billing update karo
            updateBilling(body, (bErr, bResult) => {
                if (bErr) console.log("Billing update failed:", bErr);

                //Step 3: Estimate insert (NAYA)
                insertEstimateFromPayment(paymentId, body, () => {
                    res.status(201).json({
                        success: true,
                        message: "Payment saved successfully",
                        data: { id: paymentId, ...body },
                        creditListUpdated: clResult,
                        billingUpdated: bResult,
                    });
                });
            });
        });
    });
};

// ==================== UPDATE CREDIT LIST ====================
const updateCreditList = (paymentBody, callback) => {
    const { accountNo, clientName, mobile, pay, addition, dueDate } =
        paymentBody;

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
        if (findErr) return callback(findErr);

        if (rows.length === 0) {
            return callback(null, { updated: false, message: "Not found" });
        }

        const creditList = rows[0];
        const payAmount = parseFloat(pay) || 0;
        const additionAmount = parseFloat(addition) || 0;

        const newCash = (parseFloat(creditList.cash) || 0) + payAmount;
        const newBalance =
            (parseFloat(creditList.finalBalance) || 0) - additionAmount;
        const finalBalance = newBalance < 0 ? 0 : newBalance;
        const newNextDate = dueDate || creditList.nextDate;

        db.query(
            `UPDATE credit_list
             SET cash = ?, finalBalance = ?, nextDate = ?
             WHERE id = ?`,
            [
                newCash.toFixed(2),
                finalBalance.toFixed(2),
                newNextDate,
                creditList.id,
            ],
            (updateErr) => {
                if (updateErr) return callback(updateErr);
                callback(null, {
                    updated: true,
                    creditListId: creditList.id,
                    oldCash: creditList.cash,
                    newCash: newCash.toFixed(2),
                    oldBalance: creditList.finalBalance,
                    newBalance: finalBalance.toFixed(2),
                    newNextDate,
                });
            }
        );
    });
};

// ==================== UPDATE BILLING ====================
const updateBilling = (paymentBody, callback) => {
    const {
        accountNo,
        clientName,
        mobile,
        addition,
        dueDate,
        billingId: providedBillingId,
        billNo: providedBillNo,
    } = paymentBody;

    let findQuery = "";
    let params = [];

    if (providedBillingId) {
        findQuery = `SELECT * FROM billing WHERE id = ? AND activeStatus = 1`;
        params = [providedBillingId];
    } else if (providedBillNo) {
        findQuery = `SELECT * FROM billing WHERE billNo = ? AND activeStatus = 1`;
        params = [providedBillNo];
    } else {
        findQuery = `
            SELECT * FROM billing
            WHERE activeStatus = 1
            AND (
                (accountNo = ? AND accountNo IS NOT NULL AND accountNo != '')
                OR (mobile = ? AND mobile IS NOT NULL AND mobile != '')
                OR customerName = ?
            )
            ORDER BY id DESC
            LIMIT 1
        `;
        params = [accountNo, mobile, clientName];
    }

    db.query(findQuery, params, (findErr, rows) => {
        if (findErr) return callback(findErr);

        if (rows.length === 0) {
            return callback(null, {
                updated: false,
                message: "No matching billing found",
            });
        }

        const billing = rows[0];
        const additionAmount = parseFloat(addition) || 0;

        //paid update ho raha hai, cash nahi
        const oldPaid = parseFloat(billing.paid) || 0;
        const oldBalance = parseFloat(billing.balance) || 0;

        const newPaid = oldPaid + additionAmount;
        const newBalance = oldBalance - additionAmount;

        const finalBalance = newBalance < 0 ? 0 : newBalance;
        const newDueDate = dueDate || billing.dueDate;

        //updateBilling query — paid, balance, dueDate update
        const updateQuery = `
            UPDATE billing
            SET paid = ?, balance = ?, dueDate = ?
            WHERE id = ?
        `;

        db.query(
            updateQuery,
            [
                newPaid.toFixed(2),
                finalBalance.toFixed(2),
                newDueDate,
                billing.id,
            ],
            (updateErr) => {
                if (updateErr) return callback(updateErr);

                callback(null, {
                    updated: true,
                    billingId: billing.id,
                    billNo: billing.billNo,
                    oldPaid: oldPaid.toFixed(2),
                    newPaid: newPaid.toFixed(2),
                    oldBalance: oldBalance.toFixed(2),
                    newBalance: finalBalance.toFixed(2),
                    newDueDate,
                });
            }
        );
    });
};

// ==================== INSERT ESTIMATE (FROM PAYMENT) ====================
const insertEstimateFromPayment = (paymentId, paymentData, callback) => {
    const estimateBody = {
        billingId: paymentData.billingId || paymentId, // Link
        billNo: paymentData.billNo || "",
        billDate: paymentData.currentDate,             // payment ki date
        customerName: paymentData.clientName,
        accountNo: paymentData.accountNo,
        amount: paymentData.amount,
        pay: paymentData.pay,
        oldGold: paymentData.oldGold,
        textSwapOnline: paymentData.swap,
        round: paymentData.round,
        balance: paymentData.balance,
        dueDate: paymentData.dueDate,
        additionAll: paymentData.addition,             // pay + gold + swap + round
        totalFinal: paymentData.amount,                // original total amount
    };

    const estimateValues = pickEstimateFields(estimateBody);

    const insertQuery = `
        INSERT INTO estimate
        (${estimateFields.join(", ")})
        VALUES (${estimateFields.map(() => "?").join(", ")})
    `;

    db.query(insertQuery, estimateValues, (insertErr) => {
        if (insertErr) console.log("Estimate insert failed from CreditPayment:", insertErr);
        callback();
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

            db.query(
                `DELETE FROM credit_payment WHERE id = ?`,
                [id],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Delete failed",
                            error: err,
                        });
                    }

                    reverseCreditList(payment, () => {
                        reverseBilling(payment, () => {
                            res.status(200).json({
                                success: true,
                                message:
                                    "Payment deleted and credit list & billing updated",
                            });
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
        if (findErr || rows.length === 0) return callback();

        const creditList = rows[0];
        const payAmount = parseFloat(pay) || 0;
        const additionAmount = parseFloat(addition) || 0;

        const newCash = (parseFloat(creditList.cash) || 0) - payAmount;
        const newBalance =
            (parseFloat(creditList.finalBalance) || 0) + additionAmount;

        db.query(
            `UPDATE credit_list SET cash = ?, finalBalance = ? WHERE id = ?`,
            [
                (newCash < 0 ? 0 : newCash).toFixed(2),
                newBalance.toFixed(2),
                creditList.id,
            ],
            (err) => {
                if (err) console.log("Reverse credit_list failed:", err);
                callback();
            }
        );
    });
};

// ==================== REVERSE BILLING ====================
const reverseBilling = (payment, callback) => {
    const {
        accountNo,
        clientName,
        mobile,
        addition,
        billingId: providedBillingId,
        billNo: providedBillNo,
    } = payment;

    let findQuery = "";
    let params = [];

    if (providedBillingId) {
        findQuery = `SELECT * FROM billing WHERE id = ? AND activeStatus = 1`;
        params = [providedBillingId];
    } else if (providedBillNo) {
        findQuery = `SELECT * FROM billing WHERE billNo = ? AND activeStatus = 1`;
        params = [providedBillNo];
    } else {
        findQuery = `
            SELECT * FROM billing
            WHERE activeStatus = 1
            AND (
                (accountNo = ? AND accountNo IS NOT NULL AND accountNo != '')
                OR (mobile = ? AND mobile IS NOT NULL AND mobile != '')
                OR customerName = ?
            )
            ORDER BY id DESC
            LIMIT 1
        `;
        params = [accountNo, mobile, clientName];
    }

    db.query(findQuery, params, (findErr, rows) => {
        if (findErr || rows.length === 0) return callback();

        const billing = rows[0];
        const additionAmount = parseFloat(addition) || 0;

        //paid reverse ho raha hai, cash nahi
        const oldPaid = parseFloat(billing.paid) || 0;
        const oldBalance = parseFloat(billing.balance) || 0;

        const newPaid = oldPaid - additionAmount;
        const newBalance = oldBalance + additionAmount;

        db.query(
            `UPDATE billing SET paid = ?, balance = ? WHERE id = ?`,
            [
                (newPaid < 0 ? 0 : newPaid).toFixed(2),
                newBalance.toFixed(2),
                billing.id,
            ],
            (err) => {
                if (err) console.log("Reverse billing failed:", err);
                callback();
            }
        );
    });
};