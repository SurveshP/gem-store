import db from "../config/db.js";

// Items Billing fields
const itemsBillingFields = [
    "billingId",          // 👈 link to billing table (NULL jab tak save na ho)
    "billType",
    "billNo",
    "billDate",
    "customerName",
    "itemName",
    "tagNo",
    "type",
    "metalType",
    "weight",
    "amount",
    "itemDesc",
    "makingCharge",
    "percent",
    "makingAmount",
    "totalAmount",
];

const createItemsBillingTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS items_billing (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billingId INT NULL,                 -- billing.id (null jab tak save na ho)
            billType VARCHAR(50),
            billNo VARCHAR(50),
            billDate VARCHAR(20),
            customerName VARCHAR(255),
            itemName VARCHAR(255),
            tagNo VARCHAR(100),
            type VARCHAR(50),
            metalType VARCHAR(50),
            weight DECIMAL(10, 3),
            amount DECIMAL(10, 2),
            itemDesc TEXT,
            makingCharge VARCHAR(20),
            percent DECIMAL(10, 2) DEFAULT 0,
            makingAmount DECIMAL(10, 2) DEFAULT 0,
            totalAmount DECIMAL(10, 2) DEFAULT 0,
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_billingId (billingId),
            INDEX idx_billNo (billNo)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Items Billing Table Creation Failed");
            console.log(err);
        } else {
            console.log("Items Billing Table Ready");
        }
    });
};

export { itemsBillingFields, createItemsBillingTable };