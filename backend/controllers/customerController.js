import db from "../config/db.js";
import { customerFields } from "../models/customerModel.js";

// Helper: body + file se values nikalna (INSERT ke liye)
const pickCustomerFields = (body, file) => {
    return customerFields.map((field) => {
        if (field === "photo") {
            return file ? `/uploads/customers/${file.filename}` : null;
        }
        return body[field];
    });
};

// Helper: UPDATE ke liye — sirf jo fields aayi hain wahi
const pickUpdateFields = (body, file) => {
    const data = {};

    customerFields.forEach((field) => {
        if (field === "photo") {
            if (file) data.photo = `/uploads/customers/${file.filename}`;
        } else if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
};

// ==================== CREATE CUSTOMER ====================
export const insertCustomer = (req, res) => {
    // 🔒 Check 1: sirf multipart/form-data allowed
    if (!req.is("multipart/form-data")) {
        return res.status(400).json({
            success: false,
            message:
                "Only multipart/form-data is allowed. Raw JSON is not accepted.",
        });
    }

    // 🔒 Check 2: photo file must
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message:
                "Customer photo is required. Please attach a file in form-data.",
        });
    }

    const values = pickCustomerFields(req.body, req.file);

    const query = `
        INSERT INTO customers
        (${customerFields.join(", ")})
        VALUES (${customerFields.map(() => "?").join(", ")})
    `;

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Customer creation failed",
                error: err,
            });
        }

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: {
                id: result.insertId,
                ...req.body,
                photo: `/uploads/customers/${req.file.filename}`,
            },
        });
    });
};

// ==================== GET ALL CUSTOMERS ====================
export const getAllCustomers = (req, res) => {
    const query = `SELECT * FROM customers ORDER BY id DESC`;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch customers",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET ACTIVE CUSTOMERS ====================
export const getActiveCustomers = (req, res) => {
    const query = `
        SELECT * FROM customers
        WHERE activeStatus = true
        ORDER BY id DESC
    `;

    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch active customers",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET SINGLE CUSTOMER ====================
export const getCustomerById = (req, res) => {
    const { id } = req.params;

    db.query(`SELECT * FROM customers WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch customer",
                error: err,
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.status(200).json({ success: true, data: result[0] });
    });
};

// ==================== SEARCH CUSTOMERS ====================
export const searchCustomers = (req, res) => {
    const { search = "" } = req.query;

    const query = `
        SELECT *
        FROM customers
        WHERE activeStatus = 1
        AND (
            customerName LIKE ?
            OR mobileNo LIKE ?
            OR accountNo LIKE ?
            OR pan LIKE ?
            OR aadharNo LIKE ?
        )
        ORDER BY id DESC
    `;

    const searchValue = `%${search}%`;

    db.query(
        query,
        [searchValue, searchValue, searchValue, searchValue, searchValue],
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

// ==================== UPDATE CUSTOMER ====================
export const updateCustomer = (req, res) => {
    const { id } = req.params;
    const data = pickUpdateFields(req.body, req.file);

    const keys = Object.keys(data);

    if (keys.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No fields to update",
        });
    }

    const query = `
        UPDATE customers
        SET ${keys.map((k) => `${k} = ?`).join(", ")}
        WHERE id = ?
    `;

    const values = [...keys.map((k) => data[k]), id];

    db.query(query, values, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Customer update failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: result,
        });
    });
};

// ==================== UPDATE CUSTOMER STATUS ====================
export const updateCustomerStatus = (req, res) => {
    const { id } = req.params;
    const { activeStatus } = req.body;

    const query = `
        UPDATE customers
        SET activeStatus = ?
        WHERE id = ?
    `;

    db.query(query, [activeStatus, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to update customer status",
                error: err,
            });
        }

        res.status(200).json({
            success: true,
            message: "Customer status updated successfully",
            data: result,
        });
    });
};

// ==================== DELETE CUSTOMER ====================
export const deleteCustomer = (req, res) => {
    const { id } = req.params;

    db.query(`DELETE FROM customers WHERE id = ?`, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Customer delete failed",
                error: err,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
            data: result,
        });
    });
};