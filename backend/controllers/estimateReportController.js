import db from "../config/db.js";

// ==================== HELPER: Date Normalization ====================
// Ye function kisi bhi format ko DB ke format ('DD-MM-YYYY') mein badal dega
const normalizeDate = (dateStr) => {
    if (!dateStr) return "";
    let str = dateStr.trim();

    // Agar format YYYY-MM-DD ya YYYY/MM/DD hai (Frontend ya Postman se)
    if (str.includes("-") || str.includes("/")) {
        // Slash ko hyphen mein badlo taaki split aasan ho
        str = str.replace(/\//g, "-"); 
        const parts = str.split("-");
        
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                // YYYY-MM-DD -> DD-MM-YYYY
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else {
                // Already DD-MM-YYYY hai
                return `${parts[0]}-${parts[1]}-${parts[2]}`;
            }
        }
    }
    return str;
};

// ==================== GET ESTIMATE REPORT (Default = Today) ====================
export const getEstimateReport = (req, res) => {
    // Aaj ki date nikaalo DD-MM-YYYY mein
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const todayDate = `${day}-${month}-${year}`;

    const query = `
        SELECT * FROM estimate
        WHERE activeStatus = 1 AND billDate = ?
        ORDER BY id DESC
    `;

    db.query(query, [todayDate], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        const totalCash = result.reduce((sum, row) => sum + (Number(row.pay) || 0), 0);
        
        res.status(200).json({
            success: true,
            data: result,
            summary: { totalRecord: result.length, totalCash }
        });
    });
};

// ==================== SEARCH ESTIMATE REPORT ====================
export const searchEstimateReport = (req, res) => {
    //Frontend aur Postman dono ke params accept karega
    const rawDate = req.query.dateFrom || req.query.billDate;

    if (!rawDate || !rawDate.trim()) {
        return res.status(400).json({ success: false, message: "Date is required. Pass dateFrom or billDate." });
    }

    //Date ko DB format mein convert karo
    const formattedDate = normalizeDate(rawDate);
    console.log("🔍 Searching for Date:", formattedDate); // Debugging ke liye

    const query = `
        SELECT * FROM estimate
        WHERE activeStatus = 1 AND billDate = ?
        ORDER BY id DESC
    `;

    db.query(query, [formattedDate], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Search failed", error: err });
        }

        const totalCash = result.reduce((sum, row) => sum + (Number(row.pay) || 0), 0);

        res.status(200).json({
            success: true,
            data: result,
            summary: { totalRecord: result.length, totalCash }
        });
    });
};

// ==================== GET PAYMENT DATEWISE (Date Range) ====================
export const getPaymentDatewise = (req, res) => {
    const { dateFrom = "", dateTo = "" } = req.query;

    if (!dateFrom || !dateTo) {
        return res.status(400).json({
            success: false,
            message: "Both Date From and Date To are required",
        });
    }

    // Convert YYYY-MM-DD to DD-MM-YYYY
    const convertToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    const formattedFrom = convertToDDMMYYYY(dateFrom);
    const formattedTo = convertToDDMMYYYY(dateTo);

    // Sirf wahi rows laao jahan payment (pay) 0 se badi ho
    const query = `
        SELECT * FROM estimate
        WHERE activeStatus = 1 
        AND pay > 0 
        AND billDate BETWEEN ? AND ?
        ORDER BY id DESC
    `;

    db.query(query, [formattedFrom, formattedTo], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        // Total Cash calculate karo sirf pay ka
        const totalCash = result.reduce((sum, row) => sum + (Number(row.pay) || 0), 0);
        
        res.status(200).json({
            success: true,
            data: result,
            summary: { totalRecord: result.length, totalCash }
        });
    });
};

// ==================== GET CREDIT BALANCE DATEWISE (Date Range) ====================
export const getCreditBalanceDatewise = (req, res) => {
    const { dateFrom = "", dateTo = "" } = req.query;

    if (!dateFrom || !dateTo) {
        return res.status(400).json({
            success: false,
            message: "Both Date From and Date To are required",
        });
    }

    // Convert YYYY-MM-DD to DD-MM-YYYY
    const convertToDDMMYYYY = (dateStr) => {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    const formattedFrom = convertToDDMMYYYY(dateFrom);
    const formattedTo = convertToDDMMYYYY(dateTo);

    // Sirf wahi rows laao jahan balance 0 se badi ho
    const query = `
        SELECT * FROM estimate
        WHERE activeStatus = 1 
        AND balance > 0 
        AND billDate BETWEEN ? AND ?
        ORDER BY id DESC
    `;

    db.query(query, [formattedFrom, formattedTo], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        // Total Balance calculate karo
        const totalBalance = result.reduce((sum, row) => sum + (Number(row.balance) || 0), 0);
        
        res.status(200).json({
            success: true,
            data: result,
            summary: { totalRecord: result.length, totalBalance }
        });
    });
};