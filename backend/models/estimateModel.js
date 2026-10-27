import db from "../config/db.js";

const estimateFields = [
    "billingId",
    "expenseId",    // 👈 NAYA (Expense ko link karne ke liye)
    "billNo",
    "billDate",
    "customerName",
    "accountNo",
    "amount",
    "pay",
    "oldGold",
    "textSwapOnline",
    "round",
    "balance",
    "dueDate",
    "additionAll",
    "totalFinal",
    "income",
    "expense",
    "remark",
];

const createEstimateTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS estimate (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billingId INT NULL,
            expenseId INT NULL,                   -- 👈 NAYA
            billNo VARCHAR(50),
            billDate VARCHAR(20),
            customerName VARCHAR(255),
            accountNo VARCHAR(100),
            amount DECIMAL(10, 2) DEFAULT 0,
            pay DECIMAL(10, 2) DEFAULT 0,
            oldGold DECIMAL(10, 2) DEFAULT 0,
            textSwapOnline DECIMAL(10, 2) DEFAULT 0,
            round DECIMAL(10, 2) DEFAULT 0,
            balance DECIMAL(10, 2) DEFAULT 0,
            dueDate VARCHAR(50),
            additionAll DECIMAL(10, 2) DEFAULT 0,
            totalFinal DECIMAL(10, 2) DEFAULT 0,
            income DECIMAL(10, 2) DEFAULT 0,
            expense DECIMAL(10, 2) DEFAULT 0,
            remark TEXT,
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_billNo (billNo),
            INDEX idx_billingId (billingId),
            INDEX idx_expenseId (expenseId)       -- 👈 NAYA
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