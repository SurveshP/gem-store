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

// ==================== GET CREDIT LIST BY SEARCH (Name, Account, Mobile) ====================
export const getCreditListByCustomer = (req, res) => {
    // Frontend se ab 'search' query aayegi
    const { search = "" } = req.query;
    const searchValue = `%${search}%`;

    const query = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND (
            clientName LIKE ? 
            OR accountNo LIKE ? 
            OR mobile LIKE ?
        )
        ORDER BY id DESC
    `;

    db.query(query, [searchValue, searchValue, searchValue], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to search credit list",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET CREDIT LIST DATEWISE (Date Range) ====================
export const getCreditListDatewise = (req, res) => {
    // Frontend se YYYY-MM-DD format mein date aayegi
    const { dateFrom = "", dateTo = "" } = req.query;

    if (!dateFrom || !dateTo) {
        return res.status(400).json({
            success: false,
            message: "Both Date From and Date To are required",
        });
    }

    //Helper function: YYYY-MM-DD ko DD/MM/YYYY mein badalne ke liye
    const convertToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    };

    const formattedDateFrom = convertToDDMMYYYY(dateFrom);
    const formattedDateTo = convertToDDMMYYYY(dateTo);

    // Ab query mein converted date bhejenge
    const query = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND billDate BETWEEN ? AND ?
        ORDER BY id DESC
    `;

    db.query(query, [formattedDateFrom, formattedDateTo], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch datewise credit list",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};