import db from "../config/db.js";
import { customerFields } from "../models/customerModel.js";

// Helper: body + file se values nikalna
const pickCustomerFields = (body, file) => {
    return customerFields.map((field) => {
        // photo field ke liye file ka path
        if (field === "photo") {
            return file ? `uploads/${file.filename}` : body.photo || null;
        }
        return body[field] ?? null;
    });
};

// CREATE CUSTOMER (POST - form-data)
export const insertCustomer = (req, res) => {
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
            data: { id: result.insertId, ...req.body, photo: req.file ? `uploads/${req.file.filename}` : null },
        });
    });
};

// GET ALL CUSTOMERS
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

// GET ACTIVE CUSTOMERS
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

// GET SINGLE CUSTOMER
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

        res.status(200).json({ success: true, data: result });
    });
};

// SEARCH CUSTOMERS (GET)
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

// UPDATE CUSTOMER (POST - form-data)
export const updateCustomer = (req, res) => {
    const { id } = req.params;

    // Pehle purani photo fetch karo (agar nayi upload nahi hui)
    db.query(`SELECT photo FROM customers WHERE id = ?`, [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch customer",
                error: err,
            });
        }

        const oldPhoto = rows?.[0]?.photo || null;

        // File nahi aayi to purani photo rakho
        const bodyWithOldPhoto = { ...req.body };
        if (!req.file && oldPhoto) {
            bodyWithOldPhoto.photo = oldPhoto;
        }

        const values = pickCustomerFields(bodyWithOldPhoto, req.file);

        const query = `
            UPDATE customers
            SET ${customerFields.map((field) => `${field} = ?`).join(", ")}
            WHERE id = ?
        `;

        db.query(query, [...values, id], (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Customer update failed",
                    error: err,
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: result,
            });
        });
    });
};

// UPDATE CUSTOMER STATUS (POST)
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

// DELETE CUSTOMER (POST)
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

        res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
            data: result,
        });
    });
};