import db from "../config/db.js";

// ==================== HELPER: DD/MM/YYYY to YYYY-MM-DD ====================
// Frontend se 'DD/MM/YYYY' aata hai, MySQL mein 'YYYY-MM-DD' chahiye hota hai
const formatToDB = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
};

// ==================== HELPER: Merge IN & OUT Data ====================
const mergeInOutData = (inResult, outResult) => {
    const timelineMap = new Map();

    // 1. Add IN Data
    inResult.forEach(row => {
        const key = row.tagNo ? row.tagNo.trim() : `IN_${row.id}`;
        timelineMap.set(key, {
            item: row.item,
            tagNo: row.tagNo,
            type: row.type,
            metalType: row.metalType,
            weight: row.weight,
            inDate: row.inDate || '-',
            inBillNo: row.inBillNo || '-',
            vendorName: row.vendorName || '-',
            outDate: '-',
            outBillNo: '-',
            customerName: '-',
            accountNo: '-'
        });
    });

    // 2. Merge OUT Data
    outResult.forEach(row => {
        const key = row.tagNo ? row.tagNo.trim() : `OUT_${row.id}`;
        if (timelineMap.has(key)) {
            const existing = timelineMap.get(key);
            existing.outDate = row.outDate || '-';
            existing.outBillNo = row.outBillNo || '-';
            existing.customerName = row.customerName || '-';
            existing.accountNo = row.accountNo || '-';
        } else {
            timelineMap.set(key, {
                item: row.item,
                tagNo: row.tagNo,
                type: row.type,
                metalType: row.metalType,
                weight: row.weight,
                inDate: '-',
                inBillNo: '-',
                vendorName: '-',
                outDate: row.outDate || '-',
                outBillNo: row.outBillNo || '-',
                customerName: row.customerName || '-',
                accountNo: row.accountNo || '-'
            });
        }
    });

    return Array.from(timelineMap.values()).sort((a, b) => {
        const dateA = a.outDate !== '-' ? a.outDate : a.inDate;
        const dateB = b.outDate !== '-' ? b.outDate : a.inDate;
        if(dateA === '-' || dateB === '-') return 0;
        return new Date(dateB.split('/').reverse().join('-')) - new Date(dateA.split('/').reverse().join('-'));
    });
};


// ==================== 1. STOCK SUMMARY (Item-wise Tabs) ====================
export const getStockSummary = (req, res) => {
    const { type = "Individual", date = "" } = req.query;
    const dbDate = formatToDB(date);

    // INDIVIDUAL LOGIC
    if (type === "Individual") {
        // Note: Single date filter applies to stockBillDate
        let stockQuery = `
            SELECT item, COUNT(tagNo) AS totalIn,
            SUM(CASE WHEN activeStatus = 0 THEN 1 ELSE 0 END) AS saleOut,
            SUM(CASE WHEN activeStatus = 1 THEN 1 ELSE 0 END) AS current
            FROM stocks WHERE types = 'Individual'
        `;
        const params = [];
        if (dbDate) {
            stockQuery += ` AND stockBillDate = ?`;
            params.push(dbDate);
        }
        stockQuery += ` GROUP BY item`;

        db.query(stockQuery, params, (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });
            const summaryData = result.map((row) => ({
                item: row.item,
                stockIn: Number(row.totalIn) || 0,
                saleOut: Number(row.saleOut) || 0,
                current: Number(row.current) || 0,
            }));
            // Note: History popup ke liye purana logic yahan rahega
            res.status(200).json({ success: true, data: summaryData });
        });
        return;
    }

    // GROUP LOGIC (Simplified for brevity, aap isme bhi date add kar sakte hain)
    const stockInQuery = `SELECT item, SUM(weight) AS totalIn FROM stocks WHERE activeStatus = 1 AND types = 'Group' GROUP BY item`;
    const stockOutQuery = `
        SELECT ib.itemName AS item, SUM(ib.weight) AS totalOut
        FROM items_billing ib INNER JOIN billing b ON ib.billNo = b.billNo
        WHERE b.activeStatus = 1 AND ib.type = 'Group' GROUP BY ib.itemName
    `;
    
    db.query(stockInQuery, (inErr, inResult) => {
        if (inErr) return res.status(500).json({ success: false, error: inErr });
        db.query(stockOutQuery, (outErr, outResult) => {
            if (outErr) return res.status(500).json({ success: false, error: outErr });
            
            const summaryMap = new Map();
            inResult.forEach((row) => {
                summaryMap.set(row.item, { item: row.item, stockIn: Number(row.totalIn) || 0, saleOut: 0, current: Number(row.totalIn) || 0 });
            });
            outResult.forEach((row) => {
                if (summaryMap.has(row.item)) {
                    const existing = summaryMap.get(row.item);
                    existing.saleOut = Number(row.totalOut) || 0;
                    existing.current = Math.max(0, existing.stockIn - existing.saleOut);
                }
            });
            res.status(200).json({ success: true, data: Array.from(summaryMap.values()) });
        });
    });
};


// ==================== 2. STOCK TIMELINE (Single Date) ====================
export const getStockTimeline = (req, res) => {
    const { search = "", date = "" } = req.query;
    const searchValue = `%${search}%`;
    const dbDate = formatToDB(date);

    let stockInQuery = `
        SELECT id, item, tagNo, types AS type, metalType, weight, 
        DATE_FORMAT(stockBillDate, '%d/%m/%Y') AS inDate, billNo AS inBillNo, venderName AS vendorName
        FROM stocks WHERE (item LIKE ? OR tagNo LIKE ? OR billNo LIKE ?)
    `;
    const inParams = [searchValue, searchValue, searchValue];
    if (dbDate) {
        stockInQuery += ` AND stockBillDate = ?`;
        inParams.push(dbDate);
    }

    let stockOutQuery = `
        SELECT ib.id, ib.itemName AS item, ib.tagNo, ib.type, ib.metalType, ib.weight, 
        DATE_FORMAT(ib.billDate, '%d/%m/%Y') AS outDate, b.billNo AS outBillNo, b.customerName, b.accountNo
        FROM items_billing ib INNER JOIN billing b ON ib.billNo = b.billNo
        WHERE b.activeStatus = 1 AND (ib.itemName LIKE ? OR ib.tagNo LIKE ? OR b.billNo LIKE ? OR b.customerName LIKE ?)
    `;
    const outParams = [searchValue, searchValue, searchValue, searchValue];
    if (dbDate) {
        stockOutQuery += ` AND b.billDate = ?`;
        outParams.push(dbDate);
    }

    db.query(stockInQuery, inParams, (inErr, inResult) => {
        if (inErr) return res.status(500).json({ success: false, error: inErr });
        db.query(stockOutQuery, outParams, (outErr, outResult) => {
            if (outErr) return res.status(500).json({ success: false, error: outErr });
            
            const mergedData = mergeInOutData(inResult, outResult);
            res.status(200).json({ success: true, data: mergedData });
        });
    });
};


// ==================== 4. METAL REGISTER (Gold/Silver Date Range) ====================
export const getStockInOutMetalRegister = (req, res) => {
    //Metal Type dynamic ho gaya (Default Gold)
    const { search = "", dateFrom = "", dateTo = "", metalType = "Gold" } = req.query;
    
    const searchValue = `%${search}%`;
    const dbFrom = formatToDB(dateFrom);
    const dbTo = formatToDB(dateTo);

    // IN Query
    let stockInQuery = `
        SELECT id, item, tagNo, types AS type, metalType, weight, 
        DATE_FORMAT(stockBillDate, '%d/%m/%Y') AS inDate, billNo AS inBillNo, venderName AS vendorName
        FROM stocks WHERE metalType = ? AND (item LIKE ? OR tagNo LIKE ? OR billNo LIKE ?)
    `;
    // Params: [metalType, search, search, search]
    const inParams = [metalType, searchValue, searchValue, searchValue];
    
    if (dbFrom && dbTo) {
        stockInQuery += ` AND stockBillDate BETWEEN ? AND ?`;
        inParams.push(dbFrom, dbTo);
    } else if (dbFrom) {
        stockInQuery += ` AND stockBillDate >= ?`;
        inParams.push(dbFrom);
    } else if (dbTo) {
        stockInQuery += ` AND stockBillDate <= ?`;
        inParams.push(dbTo);
    }

    // OUT Query
    let stockOutQuery = `
        SELECT ib.id, ib.itemName AS item, ib.tagNo, ib.type, ib.metalType, ib.weight, 
        DATE_FORMAT(ib.billDate, '%d/%m/%Y') AS outDate, b.billNo AS outBillNo, b.customerName, b.accountNo
        FROM items_billing ib INNER JOIN billing b ON ib.billNo = b.billNo
        WHERE b.activeStatus = 1 AND ib.metalType = ?
        AND (ib.itemName LIKE ? OR ib.tagNo LIKE ? OR b.billNo LIKE ? OR b.customerName LIKE ?)
    `;
    // Params: [metalType, search, search, search, search]
    const outParams = [metalType, searchValue, searchValue, searchValue, searchValue];

    if (dbFrom && dbTo) {
        stockOutQuery += ` AND b.billDate BETWEEN ? AND ?`;
        outParams.push(dbFrom, dbTo);
    } else if (dbFrom) {
        stockOutQuery += ` AND b.billDate >= ?`;
        outParams.push(dbFrom);
    } else if (dbTo) {
        stockOutQuery += ` AND b.billDate <= ?`;
        outParams.push(dbTo);
    }

    db.query(stockInQuery, inParams, (inErr, inResult) => {
        if (inErr) return res.status(500).json({ success: false, error: inErr });
        db.query(stockOutQuery, outParams, (outErr, outResult) => {
            if (outErr) return res.status(500).json({ success: false, error: outErr });
            
            const mergedData = mergeInOutData(inResult, outResult);
            res.status(200).json({ success: true, data: mergedData });
        });
    });
};