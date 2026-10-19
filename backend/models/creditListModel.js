import db from "../config/db.js";

// Credit List fields (ASP.NET tblCreditList ke hisaab se)
const creditListFields = [
    "billingId",
    "billNo",
    "clientName",
    "accountNo",
    "billDate",
    "finalAmount",
    "cash",
    "oldGold",
    "finalBalance",
    "nextDate",
    "remark",
    "mobile",
    "referredBy",
];

const createCreditListTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS credit_list (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billingId INT NULL,
            billNo VARCHAR(50),
            clientName VARCHAR(255),
            accountNo VARCHAR(100),
            billDate VARCHAR(20),
            finalAmount DECIMAL(10, 2) DEFAULT 0,
            cash DECIMAL(10, 2) DEFAULT 0,
            oldGold DECIMAL(10, 2) DEFAULT 0,
            finalBalance DECIMAL(10, 2) DEFAULT 0,
            nextDate VARCHAR(20),
            remark TEXT,
            mobile VARCHAR(20),
            referredBy VARCHAR(255),
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_billNo (billNo),
            INDEX idx_billingId (billingId),
            INDEX idx_mobile (mobile)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Credit List Table Creation Failed");
            console.log(err);
        } else {
            console.log("Credit List Table Ready");
        }
    });
};

export { creditListFields, createCreditListTable };