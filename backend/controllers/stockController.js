import db from "../config/db.js";
import { stockFields } from "../models/stockModel.js";
import { stockGroupFields } from "../models/stockGroupModel.js";

// Helper: body se sirf stock fields nikalna
const pickStockFields = (body) => {
    return stockFields.map((field) => body[field]);
};

// Helper: UPDATE ke liye — sirf jo fields aayi hain
const pickUpdateFields = (body) => {
    const data = {};
    stockFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });
    return data;
};

// ==================== NEXT BILL NO ====================
// Format: BILL-0001, BILL-0002, ...
export const getNextBillNo = (req, res) => {
    const query = `
        SELECT billNo FROM stocks
        WHERE billNo LIKE 'BILL-%'
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch next bill no",
                error: err,
            });
        }

        let nextNo = 1;

        if (result.length > 0 && result[0].billNo) {
            const lastBill = result[0].billNo;           // e.g., "BILL-0007"
            const numPart = parseInt(lastBill.split("-")[1], 10);
            if (!isNaN(numPart)) {
                nextNo = numPart + 1;
            }
        }

        const billNo = `BILL-${String(nextNo).padStart(4, "0")}`;

        res.status(200).json({
            success: true,
            billNo,
        });
    });
};

// ==================== LAST TAG ====================
// Us item + type ka last tagNo return karega
export const getLastTag = (req, res) => {
    const { item = "", types = "" } = req.query;

    if (!item) {
        return res.status(400).json({
            success: false,
            message: "item is required",
        });
    }

    const query = `
        SELECT tagNo FROM stocks
        WHERE item = ? AND types = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(query, [item, types], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch last tag",
                error: err,
            });
        }

        const lastTag = result.length > 0 ? result[0].tagNo : "";

        res.status(200).json({
            success: true,
            lastTag,
        });
    });
};

// ==================== CREATE SINGLE STOCK  ====================
// export const insertStock = (req, res) => {
//     // 🔒 JSON only
//     if (!req.is("application/json")) {
//         return res.status(400).json({
//             success: false,
//             message: "Only application/json is allowed for stock.",
//         });
//     }

//     const body = req.body;

//     // 🔒 Basic validation
//     if (!body.item?.toString().trim()) {
//         return res.status(400).json({
//             success: false,
//             message: "Item is required",
//         });
//     }

//     // ✅ AUTO BILL NO if not provided
//     const doInsert = (billNo) => {
//         const finalBody = { ...body, billNo };

//         const values = pickStockFields(finalBody);

//         const query = `
//             INSERT INTO stocks
//             (${stockFields.join(", ")})
//             VALUES (${stockFields.map(() => "?").join(", ")})
//         `;

//         db.query(query, values, (err, result) => {
//             if (err) {
//                 // Duplicate billNo case — retry ek baar
//                 if (err.code === "ER_DUP_ENTRY") {
//                     return res.status(409).json({
//                         success: false,
//                         message: "Bill No already exists. Please try again.",
//                         error: err,
//                     });
//                 }
//                 return res.status(500).json({
//                     success: false,
//                     message: "Stock creation failed",
//                     error: err,
//                 });
//             }

//             res.status(201).json({
//                 success: true,
//                 message: "Stock created successfully",
//                 data: {
//                     id: result.insertId,
//                     ...finalBody,
//                 },
//             });
//         });
//     };

//     // Agar billNo diya hai to seedha insert
//     if (body.billNo && body.billNo.toString().trim()) {
//         return doInsert(body.billNo);
//     }

//     // Warna auto-generate karo
//     const query = `
//         SELECT billNo FROM stocks
//         WHERE billNo LIKE 'BILL-%'
//         ORDER BY id DESC
//         LIMIT 1
//     `;

//     db.query(query, (err, result) => {
//         if (err) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to generate bill no",
//                 error: err,
//             });
//         }

//         let nextNo = 1;

//         if (result.length > 0 && result[0].billNo) {
//             const numPart = parseInt(result[0].billNo.split("-")[1], 10);
//             if (!isNaN(numPart)) nextNo = numPart + 1;
//         }

//         const billNo = `BILL-${String(nextNo).padStart(4, "0")}`;
//         doInsert(billNo);
//     });
// };
// ==================== CREATE MULTIPLE STOCK  ====================
export const insertStock = (req, res) => {
    if (!req.is("application/json")) {
        return res.status(400).json({
            success: false,
            message: "Only application/json is allowed for stock.",
        });
    }

    const body = req.body;

    if (!body.item?.toString().trim()) {
        return res.status(400).json({
            success: false,
            message: "Item is required",
        });
    }

    // Helper: insert into stocks
    const insertIntoStocks = (finalBody, callback) => {
        const values = pickStockFields(finalBody);

        const query = `
            INSERT INTO stocks
            (${stockFields.join(", ")})
            VALUES (${stockFields.map(() => "?").join(", ")})
        `;

        db.query(query, values, callback);
    };

    // ✅ Helper: insert into stock_groups (history) — naya schema
    const insertIntoStockGroups = (stockId, finalBody, callback) => {
        const totalWeight = parseFloat(finalBody.weight) || 0;

        const groupBody = {
            stockId,
            billNo: finalBody.billNo,
            item: finalBody.item,
            types: finalBody.types,
            tagNo: finalBody.tagNo,
            carat: finalBody.carat,
            weight: 0,                     // 👈 CREATE pe delta = 0
            previousWeight: 0,             // 👈 pehle kuch nahi tha
            newWeight: totalWeight,        // 👈 total weight
            rate: finalBody.rate,
            metalType: finalBody.metalType,
        };

        const groupValues = stockGroupFields.map((f) => groupBody[f]);

        const query = `
        INSERT INTO stock_groups
        (${stockGroupFields.join(", ")})
        VALUES (${stockGroupFields.map(() => "?").join(", ")})
    `;

        db.query(query, groupValues, callback);
    };

    const doInsert = (billNo) => {
        const finalBody = { ...body, billNo };

        insertIntoStocks(finalBody, (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Bill No already exists. Please try again.",
                        error: err,
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: "Stock creation failed",
                    error: err,
                });
            }

            const stockId = result.insertId;
            const isGroup = finalBody.types === "Group";

            if (isGroup) {
                insertIntoStockGroups(stockId, finalBody, (groupErr) => {
                    if (groupErr) {
                        console.log("Stock Group Insert Failed:", groupErr);
                        return res.status(500).json({
                            success: false,
                            message:
                                "Stock created but Group record failed. Please contact support.",
                            error: groupErr,
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message: "Group stock created successfully",
                        data: { id: stockId, ...finalBody },
                    });
                });
            } else {
                return res.status(201).json({
                    success: true,
                    message: "Stock created successfully",
                    data: { id: stockId, ...finalBody },
                });
            }
        });
    };

    if (body.billNo && body.billNo.toString().trim()) {
        return doInsert(body.billNo);
    }

    const query = `
        SELECT billNo FROM stocks
        WHERE billNo LIKE 'BILL-%'
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate bill no",
                error: err,
            });
        }

        let nextNo = 1;

        if (result.length > 0 && result[0].billNo) {
            const numPart = parseInt(result[0].billNo.split("-")[1], 10);
            if (!isNaN(numPart)) nextNo = numPart + 1;
        }

        const billNo = `BILL-${String(nextNo).padStart(4, "0")}`;
        doInsert(billNo);
    });
};

// ==================== GET ALL STOCKS ====================
export const getAllStocks = (req, res) => {
    const query = `SELECT * FROM stocks ORDER BY id DESC`;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch stocks",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET ACTIVE STOCKS ====================
export const getActiveStocks = (req, res) => {
    const query = `
        SELECT * FROM stocks
        WHERE activeStatus = 1
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch active stocks",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE STOCK ====================
export const getStockById = (req, res) => {
    const { id } = req.params;

    db.query(`SELECT * FROM stocks WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch stock",
                error: err,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Stock not found",
            });
        }

        res.status(200).json({ success: true, data: result[0] });
    });
};

// ==================== SEARCH STOCKS ====================
export const searchStocks = (req, res) => {
    const { search = "" } = req.query;

    const query = `
        SELECT *
        FROM stocks
        WHERE activeStatus = 1
        AND (
            billNo LIKE ?
            OR item LIKE ?
            OR tagNo LIKE ?
            OR venderName LIKE ?
            OR types LIKE ?
            OR metalType LIKE ?
        )
        ORDER BY id DESC
    `;

    const searchValue = `%${search}%`;

    db.query(
        query,
        [
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
        ],
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

// ==================== UPDATE STOCK ====================
export const updateStock = (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // 🔹 Special case: Group + addWeight
    const isAddWeightCase =
        body.types === "Group" &&
        body.addWeight !== undefined &&
        body.addWeight !== null &&
        body.addWeight !== "";

    if (isAddWeightCase) {
        // Step 1: Current stock fetch karo
        db.query(`SELECT * FROM stocks WHERE id = ?`, [id], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch stock",
                    error: err,
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Stock not found",
                });
            }

            const current = rows[0];
            const previousWeight = parseFloat(current.weight) || 0;
            const addWeight = parseFloat(body.addWeight) || 0;
            const newWeight = previousWeight + addWeight;

            // Step 2: stocks table mein final weight update karo
            const updateStocksQuery = `
                UPDATE stocks
                SET weight = ?
                WHERE id = ?
            `;

            db.query(updateStocksQuery, [newWeight, id], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Failed to update stock weight",
                        error: updateErr,
                    });
                }

                // Step 3: stock_groups mein nayi history row insert karo
                const historyBody = {
                    stockId: id,
                    billNo: current.billNo,
                    item: current.item,
                    types: current.types,
                    tagNo: current.tagNo,
                    carat: body.carat || current.carat,
                    weight: addWeight,                // ✅ delta = jitna add hua
                    previousWeight: previousWeight,   // ✅ purana total
                    newWeight: newWeight,             // ✅ naya total
                    rate: body.rate || current.rate,
                    metalType: body.metalType || current.metalType,
                };

                const groupValues = stockGroupFields.map(
                    (f) => historyBody[f]
                );

                const historyQuery = `
                    INSERT INTO stock_groups
                    (${stockGroupFields.join(", ")})
                    VALUES (${stockGroupFields.map(() => "?").join(", ")})
                `;

                db.query(historyQuery, groupValues, (historyErr) => {
                    if (historyErr) {
                        console.log("History Insert Failed:", historyErr);
                        return res.status(500).json({
                            success: false,
                            message:
                                "Stock weight updated but history insert failed.",
                            error: historyErr,
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Weight added successfully",
                        data: {
                            stockId: id,
                            previousWeight,
                            addedWeight: addWeight,
                            newWeight,
                        },
                    });
                });
            });
        });

        return;
    }

    // 🔹 Normal update (Individual / Group ke baaki fields)
    const data = pickUpdateFields(body);
    const keys = Object.keys(data);

    if (keys.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No fields to update",
        });
    }

    const query = `
        UPDATE stocks
        SET ${keys.map((k) => `${k} = ?`).join(", ")}
        WHERE id = ?
    `;

    const values = [...keys.map((k) => data[k]), id];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Stock update failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Stock not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: result,
        });
    });
};

// ==================== UPDATE STOCK STATUS ====================
export const updateStockStatus = (req, res) => {
    const { id } = req.params;
    const { activeStatus } = req.body;

    const query = `
        UPDATE stocks
        SET activeStatus = ?
        WHERE id = ?
    `;

    db.query(query, [activeStatus, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to update stock status",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Stock not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock status updated successfully",
            data: result,
        });
    });
};

// ==================== DELETE STOCK ====================
export const deleteStock = (req, res) => {
    const { id } = req.params;

    db.query(`DELETE FROM stocks WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Stock delete failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Stock not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Stock deleted successfully",
            data: result,
        });
    });
};

// ==================== GET STOCK GROUP HISTORY ====================
export const getStockGroupHistory = (req, res) => {
    const { stockId } = req.params;

    const query = `
        SELECT *
        FROM stock_groups
        WHERE stockId = ?
        ORDER BY addedAt ASC, id ASC
    `;

    db.query(query, [stockId], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch group history",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};