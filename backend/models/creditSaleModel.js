import db from "../config/db.js";

const creditSaleFields = [
    "billingId",
    "billNo",
    "clientName",
    "accountNo",
    "billDate",
    "itemDescription",
    "finalAmount",
    "cash",
    "oldGold",
    "nextDate",
    "mobile",
    "referredBy",
    "billFinalBalance",
];

const createCreditSaleTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS credit_sale (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billingId INT NULL,
            billNo VARCHAR(50),
            clientName VARCHAR(255),
            accountNo VARCHAR(100),
            billDate VARCHAR(20),
            itemDescription TEXT,
            finalAmount DECIMAL(10, 2) DEFAULT 0,
            cash DECIMAL(10, 2) DEFAULT 0,
            oldGold DECIMAL(10, 2) DEFAULT 0,
            nextDate VARCHAR(20),
            mobile VARCHAR(20),
            referredBy VARCHAR(255),
            billFinalBalance DECIMAL(10, 2) DEFAULT 0,
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_billNo (billNo),
            INDEX idx_billingId (billingId),
            INDEX idx_mobile (mobile)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Credit Sale Table Creation Failed");
            console.log(err);
        } else {
            console.log("Credit Sale Table Ready");
        }
    });
};

export { creditSaleFields, createCreditSaleTable };