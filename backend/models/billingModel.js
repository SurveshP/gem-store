import db from "../config/db.js";

// Billing fields
const billingFields = [
    "billType",
    "billNo",
    "billDate",
    "customerName",
    "address",
    "mobile",
    "finalAmount",
    "cgst",
    "sgst",
    "finalTotal",
    "cash",
    "online",
    "oldGold",
    "roundAmount",
    "balance",
    "dueDate",
    "remarks",
    "paymentRemarks",
];

const createBillingTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS billing (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billType VARCHAR(50),
            billNo VARCHAR(50),
            billDate VARCHAR(20),
            customerName VARCHAR(255),
            address TEXT,
            mobile VARCHAR(20),
            finalAmount DECIMAL(10, 2) DEFAULT 0,
            cgst DECIMAL(10, 2) DEFAULT 0,
            sgst DECIMAL(10, 2) DEFAULT 0,
            finalTotal DECIMAL(10, 2) DEFAULT 0,
            cash DECIMAL(10, 2) DEFAULT 0,
            online DECIMAL(10, 2) DEFAULT 0,
            oldGold DECIMAL(10, 2) DEFAULT 0,
            roundAmount DECIMAL(10, 2) DEFAULT 0,
            balance DECIMAL(10, 2) DEFAULT 0,
            dueDate VARCHAR(20),
            remarks TEXT,
            paymentRemarks TEXT,
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_billNo (billNo)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Billing Table Creation Failed");
            console.log(err);
        } else {
            console.log("Billing Table Ready");
        }
    });
};

export { billingFields, createBillingTable };