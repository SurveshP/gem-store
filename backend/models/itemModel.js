import db from "../config/db.js";

// Item fields (Mongo schema jaisa)
const itemFields = [
    "itemName",
    "itemType",
    "shortName",
    "tagNo",
];

// Table schema
const createItemTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS items (
            id INT PRIMARY KEY AUTO_INCREMENT,
            itemName VARCHAR(255) NOT NULL,
            itemType VARCHAR(100),
            shortName VARCHAR(100),
            tagNo VARCHAR(100),
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Item Table Creation Failed");
            console.log(err);
        } else {
            console.log("Items Table Ready");
        }
    });
};

export { itemFields, createItemTable };