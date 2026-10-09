import db from "../config/db.js";
import { itemsBillingFields } from "../models/itemsBillingModel.js";

const pickItemsBillingFields = (body) => {
    return itemsBillingFields.map((field) => body[field] ?? null);
};

// ==================== NEXT BILL NO ====================
export const getNextBillNo = (req, res) => {
    const { billType } = req.params;

    let prefix = "OSJ";
    if (billType === "Bill WG") prefix = "WOSJ";
    else if (billType === "Estimate") prefix = "EOSJ";

    const query = `
        SELECT billNo FROM billing
        WHERE billType = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(query, [billType], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch next bill no",
                error: err,
            });
        }

        let nextNo = 1;

        if (result.length > 0 && result[0].billNo) {
            const parts = result[0].billNo.split("-");
            const numPart = parseInt(parts[1], 10);
            if (!isNaN(numPart)) nextNo = numPart + 1;
        }

        const billNo = `${prefix}-${String(nextNo).padStart(6, "0")}`;

        res.status(200).json({
            success: true,
            billNo,
        });
    });
};

// ==================== CREATE ITEM BILLING ====================
export const insertItemsBilling = (req, res) => {
    if (!req.is("application/json")) {
        return res.status(400).json({
            success: false,
            message: "Only application/json is allowed.",
        });
    }

    const body = req.body;

    if (!body.itemName?.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: "Item Name is required",
        });
    }

    // ✅ SERVER-SIDE CALCULATION (frontend pe bharosa mat karo)
    const amount = parseFloat(body.amount) || 0;
    const weight = parseFloat(body.weight) || 0;
    const percent = parseFloat(body.percent) || 0;
    const makingCharge = body.makingCharge || "";

    const baseAmount = amount * weight;

    let makingAmount = 0;

    if (makingCharge === "Fixed") {
        // User ne jo manual diya hai wahi use karo
        makingAmount = parseFloat(body.makingAmount) || 0;
    } else if (makingCharge === "%") {
        // Auto-calculate
        makingAmount = (baseAmount * percent) / 100;
    }

    const totalAmount = makingAmount + baseAmount;

    // Override body with calculated values
    const finalBody = {
        ...body,
        makingAmount: makingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
    };

    const values = pickItemsBillingFields(finalBody);

    const query = `
        INSERT INTO items_billing
        (${itemsBillingFields.join(", ")})
        VALUES (${itemsBillingFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Item billing creation failed",
                error: err,
            });
        }

        const itemsBillingId = result.insertId;

        handleStockUpdate(finalBody, itemsBillingId, (stockResult) => {
            db.query(
                `SELECT * FROM items_billing WHERE id = ?`,
                [itemsBillingId],
                (fetchErr, rows) => {
                    if (fetchErr) {
                        return res.status(201).json({
                            success: true,
                            message: "Item billing created successfully",
                            data: {
                                id: itemsBillingId,
                                ...finalBody,
                                ...stockResult,
                            },
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: stockResult.message || "Item added successfully",
                        data: {
                            ...rows[0],
                            ...stockResult,
                        },
                    });
                }
            );
        });
    });
};

// ==================== GET ALL ITEMS BY BILL ====================
export const getItemsByBill = (req, res) => {
    const { billNo } = req.params;

    const query = `
        SELECT * FROM items_billing
        WHERE billNo = ? AND activeStatus = 1
        ORDER BY id ASC
    `;

    db.query(query, [billNo], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch items",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET ALL ITEMS (for billing details page) ====================
export const getAllItemsBilling = (req, res) => {
    const query = `
        SELECT * FROM items_billing
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch items",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== STOCK UPDATE HELPER ====================
const handleStockUpdate = (body, itemsBillingId, callback) => {
    const { type, tagNo, itemName, weight, metalType, carat, rate } = body;

    // Individual case
    if (type === 'Individual') {
        // Us specific tagNo wale stock ko deactivate karo
        const query = `
            UPDATE stocks
            SET activeStatus = 0
            WHERE tagNo = ? AND item = ? AND activeStatus = 1
        `;

        db.query(query, [tagNo, itemName], (err, result) => {
            if (err) {
                console.log("Individual stock deactivate failed:", err);
                return callback({
                    stockUpdated: false,
                    stockAction: "error",
                    message: "Item added but stock deactivate failed",
                });
            }

            callback({
                stockUpdated: result.affectedRows > 0,
                stockAction: "deactivated",
                message: "Item added! Stock has been deactivated.",
            });
        });

        return;
    }

    // Group case
    if (type === 'Group') {
        const billingWeight = parseFloat(weight) || 0;

        // Step 1: Find the group stock
        const findQuery = `
            SELECT * FROM stocks
            WHERE item = ? AND types = 'Group' AND activeStatus = 1
            ORDER BY id DESC
            LIMIT 1
        `;

        db.query(findQuery, [itemName], (findErr, rows) => {
            if (findErr || rows.length === 0) {
                console.log("Group stock not found:", findErr);
                return callback({
                    stockUpdated: false,
                    stockAction: "not_found",
                    message: "Item added but group stock not found",
                });
            }

            const stock = rows[0];
            const currentWeight = parseFloat(stock.weight) || 0;
            const newWeight = currentWeight - billingWeight;

            if (newWeight < 0) {
                // Weight insufficient — still insert into stock_groups? 
                // Aap chahein to skip karo ya warning ke saath insert karo
                return callback({
                    stockUpdated: false,
                    stockAction: "insufficient_weight",
                    message: `Item added but insufficient stock weight. Available: ${currentWeight}g, Required: ${billingWeight}g`,
                    availableWeight: currentWeight,
                    requiredWeight: billingWeight,
                });
            }

            // Step 2: Update stocks.weight
            const updateQuery = `
                UPDATE stocks
                SET weight = ?
                WHERE id = ?
            `;

            db.query(
                updateQuery,
                [newWeight, stock.id],
                (updateErr) => {
                    if (updateErr) {
                        console.log("Group weight update failed:", updateErr);
                        return callback({
                            stockUpdated: false,
                            stockAction: "error",
                            message: "Item added but stock weight update failed",
                        });
                    }

                    // Step 3: Insert into stock_groups (history)
                    const historyBody = {
                        stockId: stock.id,
                        billNo: stock.billNo,
                        item: stock.item,
                        types: 'Group',
                        tagNo: stock.tagNo,
                        carat: carat || stock.carat,
                        weight: -billingWeight,       // 👈 negative delta (billing ke wajah se minus)
                        previousWeight: currentWeight,
                        newWeight: newWeight,
                        rate: rate || stock.rate,
                        metalType: metalType || stock.metalType,
                    };

                    const groupFields = [
                        "stockId",
                        "billNo",
                        "item",
                        "types",
                        "tagNo",
                        "carat",
                        "weight",
                        "previousWeight",
                        "newWeight",
                        "rate",
                        "metalType",
                    ];

                    const historyValues = groupFields.map(
                        (f) => historyBody[f]
                    );

                    const historyQuery = `
                        INSERT INTO stock_groups
                        (${groupFields.join(", ")})
                        VALUES (${groupFields.map(() => "?").join(", ")})
                    `;

                    db.query(historyQuery, historyValues, (historyErr) => {
                        if (historyErr) {
                            console.log(
                                "Stock group history insert failed:",
                                historyErr
                            );
                        }

                        callback({
                            stockUpdated: true,
                            stockAction: "weight_deducted",
                            message: `Item added! ${billingWeight}g deducted from stock.`,
                            deductedWeight: billingWeight,
                            newStockWeight: newWeight,
                        });
                    });
                }
            );
        });

        return;
    }

    // No type
    callback({
        stockUpdated: false,
        stockAction: "none",
        message: "Item added successfully",
    });
};

// ==================== DELETE ITEM ====================
export const deleteItemsBilling = (req, res) => {
    const { id } = req.params;

    // Step 1: Pehle item fetch karo
    db.query(
        `SELECT * FROM items_billing WHERE id = ?`,
        [id],
        (fetchErr, rows) => {
            if (fetchErr) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch item",
                    error: fetchErr,
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found",
                });
            }

            const item = rows[0];

            // Step 2: Stock restore karo
            handleStockRestore(item, (restoreResult) => {
                // Step 3: Item delete karo
                db.query(
                    `DELETE FROM items_billing WHERE id = ?`,
                    [id],
                    (delErr, delResult) => {
                        if (delErr) {
                            return res.status(500).json({
                                success: false,
                                message: "Item delete failed",
                                error: delErr,
                            });
                        }

                        if (delResult.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                message: "Item not found",
                            });
                        }

                        res.status(200).json({
                            success: true,
                            message: restoreResult.message || "Item deleted successfully",
                            stockRestored: restoreResult.stockRestored,
                            stockAction: restoreResult.stockAction,
                            addedWeight: restoreResult.addedWeight,
                        });
                    }
                );
            });
        }
    );
};

// ==================== STOCK RESTORE HELPER ====================
const handleStockRestore = (item, callback) => {
    const { type, tagNo, itemName, weight, metalType, carat, rate } = item;

    // Individual case
    if (type === 'Individual') {
        const query = `
            UPDATE stocks
            SET activeStatus = 1
            WHERE tagNo = ? AND item = ?
        `;

        db.query(query, [tagNo, itemName], (err, result) => {
            if (err) {
                console.log("Individual stock restore failed:", err);
                return callback({
                    stockRestored: false,
                    stockAction: "error",
                    message: "Item deleted but stock restore failed",
                });
            }

            callback({
                stockRestored: result.affectedRows > 0,
                stockAction: "activated",
                message: "Item deleted! Stock has been activated again.",
            });
        });

        return;
    }

    // Group case
    if (type === 'Group') {
        const billingWeight = parseFloat(weight) || 0;

        const findQuery = `
            SELECT * FROM stocks
            WHERE item = ? AND types = 'Group' AND activeStatus = 1
            ORDER BY id DESC
            LIMIT 1
        `;

        db.query(findQuery, [itemName], (findErr, rows) => {
            if (findErr || rows.length === 0) {
                console.log("Group stock not found for restore");
                return callback({
                    stockRestored: false,
                    stockAction: "not_found",
                    message: "Item deleted but group stock not found",
                });
            }

            const stock = rows[0];
            const currentWeight = parseFloat(stock.weight) || 0;
            const newWeight = currentWeight + billingWeight;

            const updateQuery = `
                UPDATE stocks
                SET weight = ?
                WHERE id = ?
            `;

            db.query(updateQuery, [newWeight, stock.id], (updateErr) => {
                if (updateErr) {
                    console.log("Group weight restore failed:", updateErr);
                    return callback({
                        stockRestored: false,
                        stockAction: "error",
                        message: "Item deleted but stock restore failed",
                    });
                }

                // History insert
                const historyBody = {
                    stockId: stock.id,
                    billNo: stock.billNo,
                    item: stock.item,
                    types: 'Group',
                    tagNo: stock.tagNo,
                    carat: carat || stock.carat,
                    weight: billingWeight,        // 👈 positive delta (wapas add)
                    previousWeight: currentWeight,
                    newWeight: newWeight,
                    rate: rate || stock.rate,
                    metalType: metalType || stock.metalType,
                };

                const groupFields = [
                    "stockId",
                    "billNo",
                    "item",
                    "types",
                    "tagNo",
                    "carat",
                    "weight",
                    "previousWeight",
                    "newWeight",
                    "rate",
                    "metalType",
                ];

                const historyValues = groupFields.map((f) => historyBody[f]);

                const historyQuery = `
                    INSERT INTO stock_groups
                    (${groupFields.join(", ")})
                    VALUES (${groupFields.map(() => "?").join(", ")})
                `;

                db.query(historyQuery, historyValues, (historyErr) => {
                    if (historyErr) {
                        console.log(
                            "Stock group history insert failed:",
                            historyErr
                        );
                    }

                    callback({
                        stockRestored: true,
                        stockAction: "weight_added",
                        addedWeight: billingWeight,
                        newStockWeight: newWeight,
                        message: `Item deleted! ${billingWeight}g added back to stock.`,
                    });
                });
            });
        });

        return;
    }

    // No type
    callback({
        stockRestored: false,
        stockAction: "none",
        message: "Item deleted successfully",
    });
};