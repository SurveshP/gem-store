import db from "../config/db.js";

// Estimate fields
const estimateFields = [
    "billingId",
    "billNo",
    "billDate",
    "customerName",
    "accountNo",
    "weightGold",
    "weightSilver",
    "cash",
    "online",
    "balance",
];

const createEstimateTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS estimate (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billingId INT NULL,
            billNo VARCHAR(50),
            billDate VARCHAR(20),
            customerName VARCHAR(255),
            accountNo VARCHAR(100),
            weightGold DECIMAL(10, 3) DEFAULT 0,
            weightSilver DECIMAL(10, 3) DEFAULT 0,
            cash DECIMAL(10, 2) DEFAULT 0,
            online DECIMAL(10, 2) DEFAULT 0,
            balance DECIMAL(10, 2) DEFAULT 0,
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_billNo (billNo),
            INDEX idx_billingId (billingId)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Estimate Table Creation Failed");
            console.log(err);
        } else {
            console.log("Estimate Table Ready");
        }
    });
};

export { estimateFields, createEstimateTable };