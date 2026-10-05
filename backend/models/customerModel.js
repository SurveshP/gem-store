import db from "../config/db.js";

// Customer fields (photo bhi include)
const customerFields = [
    "customerName",
    "accountNo",
    "address",
    "mobileNo",
    "pan",
    "aadharNo",
    "referredBy",
    "photo",         // ← naya field
];

const createCustomerTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS customers (
            id INT PRIMARY KEY AUTO_INCREMENT,
            customerName VARCHAR(255),
            accountNo VARCHAR(100),
            address TEXT,
            mobileNo VARCHAR(20),
            pan VARCHAR(20),
            aadharNo VARCHAR(20),
            referredBy VARCHAR(255),
            photo VARCHAR(500),         -- ← file path store hoga
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Customer Table Creation Failed");
            console.log(err);
        } else {
            console.log("Customers Table Ready");
        }
    });
};

export { customerFields, createCustomerTable };