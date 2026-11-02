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

// ==================== GET CREDIT LIST 25K+ (Next Date Filter) ====================
export const getCreditListAbove25K = (req, res) => {
    const { dateFrom = "", dateTo = "" } = req.query;

    if (!dateFrom || !dateTo) {
        return res.status(400).json({
            success: false,
            message: "Both Date From and Date To are required",
        });
    }

    // 1. YYYY-MM-DD (Jo frontend se aata hai)
    const from_YMD = dateFrom;
    const to_YMD = dateTo;

    // 2. DD-MM-YYYY (Converted)
    const partsFrom = dateFrom.split('-');
    const partsTo = dateTo.split('-');
    const from_DMY = `${partsFrom[2]}-${partsFrom[1]}-${partsFrom[0]}`;
    const to_DMY = `${partsTo[2]}-${partsTo[1]}-${partsTo[0]}`;

    // 3. DD/MM/YYYY (Converted with slashes)
    const from_Slash = `${partsFrom[2]}/${partsFrom[1]}/${partsFrom[0]}`;
    const to_Slash = `${partsTo[2]}/${partsTo[1]}/${partsTo[0]}`;

    // ✅ FIX: Balance ko CAST kiya (agar string hai toh) aur Date ke teeno formats check kiye
    const query = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND CAST(finalBalance AS DECIMAL(10,2)) > 25000
        AND (
            (nextDate BETWEEN ? AND ?) OR
            (nextDate BETWEEN ? AND ?) OR
            (nextDate BETWEEN ? AND ?)
        )
        ORDER BY id DESC
    `;

    const params = [
        from_YMD, to_YMD,         // Check YYYY-MM-DD
        from_DMY, to_DMY,         // Check DD-MM-YYYY
        from_Slash, to_Slash      // Check DD/MM/YYYY
    ];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch 25K credit list",
                error: err,
            });
        }

        // Terminal mein check karein kitne records mile
        console.log(`🔍 Found ${result.length} records above 25K`);

        res.status(200).json({ success: true, data: result });
    });
};

// ==================== GET CREDIT LIST ZERO BALANCE ====================
export const getCreditListZeroBalance = (req, res) => {
    const { search = "" } = req.query;
    const searchValue = `%${search}%`;

    // ✅ Query: Balance 0 ho, aur search criteria match kare
    const query = `
        SELECT * FROM credit_list
        WHERE activeStatus = 1
        AND CAST(finalBalance AS DECIMAL(10,2)) = 0
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
                message: "Failed to fetch zero balance credit list",
                error: err,
            });
        }

        res.status(200).json({ success: true, data: result });
    });
};