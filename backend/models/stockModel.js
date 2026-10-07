import db from "../config/db.js";

// Stock fields (jo frontend se aate hain)
const stockFields = [
    "billNo",
    "stockBillDate",
    "venderName",
    "item",
    "types",
    "tagNo",
    "carat",
    "weight",
    "rate",
    "lastTag",
    "metalType",
];

// Table schema
const createStockTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS stocks (
            id INT PRIMARY KEY AUTO_INCREMENT,
            billNo VARCHAR(50) UNIQUE,
            stockBillDate DATE,
            venderName VARCHAR(255),
            item VARCHAR(255),
            types VARCHAR(50),
            tagNo VARCHAR(100),
            carat VARCHAR(20),
            weight DECIMAL(10, 3),
            rate DECIMAL(10, 2),
            lastTag VARCHAR(100),
            metalType VARCHAR(50),
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Stock Table Creation Failed");
            console.log(err);
        } else {
            console.log("Stocks Table Ready");
        }
    });
};

export { stockFields, createStockTable };