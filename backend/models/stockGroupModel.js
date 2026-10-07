import db from "../config/db.js";

// Stock Group fields — history table
const stockGroupFields = [
    "stockId",           // stocks.id se link
    "billNo",
    "item",
    "types",
    "tagNo",
    "carat",
    "weight",            // 👈 sirf itna add hua (delta)
    "previousWeight",    // 👈 us waqt ka total
    "newWeight",         // 👈 add ke baad ka total
    "rate",
    "metalType",
];

const createStockGroupTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS stock_groups (
            id INT PRIMARY KEY AUTO_INCREMENT,
            stockId INT,
            billNo VARCHAR(50),
            item VARCHAR(255),
            types VARCHAR(50),
            tagNo VARCHAR(100),
            carat VARCHAR(20),
            weight DECIMAL(10, 3),            -- delta (jitna add hua)
            previousWeight DECIMAL(10, 3),    -- add se pehle ka total
            newWeight DECIMAL(10, 3),         -- add ke baad ka total
            rate DECIMAL(10, 2),
            metalType VARCHAR(50),
            activeStatus TINYINT(1) DEFAULT 1,
            addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (stockId) REFERENCES stocks(id) ON DELETE CASCADE
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Stock Group Table Creation Failed");
            console.log(err);
        } else {
            console.log("Stock Groups Table Ready");
        }
    });
};

export { stockGroupFields, createStockGroupTable };