import db from "../config/db.js";
import { itemFields } from "../models/itemModel.js";

// Helper: body se sirf item fields nikalna
const pickItemFields = (body) => {
    return itemFields.map((field) => body[field]);
};

// Helper: UPDATE ke liye — sirf jo fields aayi hain
const pickUpdateFields = (body) => {
    const data = {};
    itemFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });
    return data;
};

// ==================== CREATE ITEM ====================
export const insertItem = (req, res) => {
    // 🔒 Sirf JSON allowed (form-data nahi)
    if (!req.is("application/json")) {
        return res.status(400).json({
            success: false,
            message: "Only application/json is allowed for items.",
        });
    }

    // 🔒 Basic validation
    if (!req.body.itemName?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Item name is required",
        });
    }

    const values = pickItemFields(req.body);

    const query = `
        INSERT INTO items
        (${itemFields.join(", ")})
        VALUES (${itemFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Item creation failed",
                error: err,
            });
        }

        res.status(201).json({
            success: true,
            message: "Item created successfully",
            data: {
                id: result.insertId,
                ...req.body,
            },
        });
    });
};

// ==================== GET ALL ITEMS ====================
export const getAllItems = (req, res) => {
    const query = `SELECT * FROM items ORDER BY id DESC`;

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

// ==================== GET ACTIVE ITEMS ====================
export const getActiveItems = (req, res) => {
    const query = `
        SELECT * FROM items
        WHERE activeStatus = true
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch active items",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE ITEM ====================
export const getItemById = (req, res) => {
    const { id } = req.params;

    db.query(`SELECT * FROM items WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch item",
                error: err,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        res.status(200).json({ success: true, data: result[0] });
    });
};

// ==================== SEARCH ITEMS ====================
export const searchItems = (req, res) => {
    const { search = "" } = req.query;

    const query = `
        SELECT *
        FROM items
        WHERE activeStatus = 1
        AND (
            itemName LIKE ?
            OR itemType LIKE ?
            OR shortName LIKE ?
            OR tagNo LIKE ?
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

// ==================== UPDATE ITEM ====================
export const updateItem = (req, res) => {
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
        UPDATE items
        SET ${keys.map((k) => `${k} = ?`).join(", ")}
        WHERE id = ?
    `;

    const values = [...keys.map((k) => data[k]), id];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Item update failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: result,
        });
    });
};

// ==================== UPDATE ITEM STATUS ====================
export const updateItemStatus = (req, res) => {
    const { id } = req.params;
    const { activeStatus } = req.body;

    const query = `
        UPDATE items
        SET activeStatus = ?
        WHERE id = ?
    `;

    db.query(query, [activeStatus, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to update item status",
                error: err,
            });
        }

        res.status(200).json({
            success: true,
            message: "Item status updated successfully",
            data: result,
        });
    });
};

// ==================== DELETE ITEM ====================
export const deleteItem = (req, res) => {
    const { id } = req.params;

    db.query(`DELETE FROM items WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Item delete failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Item deleted successfully",
            data: result,
        });
    });
};