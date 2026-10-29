import db from "../config/db.js";

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