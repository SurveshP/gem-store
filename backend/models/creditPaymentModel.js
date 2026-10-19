import db from "../config/db.js";

// Credit Payment fields
const creditPaymentFields = [
    "billingId",
    "billNo",
    "clientName",
    "accountNo",
    "mobile",
    "currentDate",
    "currentTime",
    "paymentName",
    "amount",
    "pay",
    "oldGold",
    "textSwapOnline",
    "swap",
    "round",
    "addition",
    "balance",
    "remark",
    "dueDate",
];

const createCreditPaymentTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS credit_payment (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billingId INT NULL,
            billNo VARCHAR(50),
            clientName VARCHAR(255),
            accountNo VARCHAR(100),
            mobile VARCHAR(20),
            currentDate VARCHAR(20),
            currentTime VARCHAR(20),
            paymentName VARCHAR(255),
            amount DECIMAL(10, 2) DEFAULT 0,
            pay DECIMAL(10, 2) DEFAULT 0,
            oldGold DECIMAL(10, 2) DEFAULT 0,
            textSwapOnline VARCHAR(50),
            swap DECIMAL(10, 2) DEFAULT 0,
            round DECIMAL(10, 2) DEFAULT 0,
            addition DECIMAL(10, 2) DEFAULT 0,
            balance DECIMAL(10, 2) DEFAULT 0,
            remark TEXT,
            dueDate VARCHAR(20),
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_accountNo (accountNo),
            INDEX idx_billingId (billingId)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Credit Payment Table Creation Failed");
            console.log(err);
        } else {
            console.log("Credit Payment Table Ready");
        }
    });
};

export { creditPaymentFields, createCreditPaymentTable };