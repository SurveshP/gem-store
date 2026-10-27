import db from "../config/db.js";

// Expenses fields
const expensesFields = [
    "date",
    "income",
    "expense",
    "remark"
];

const createExpensesTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS expenses (
            id INT PRIMARY KEY AUTO_INCREMENT,
            date VARCHAR(20) NOT NULL,
            income DECIMAL(10, 2) DEFAULT 0,
            expense DECIMAL(10, 2) DEFAULT 0,
            remark TEXT,
            activeStatus TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_date (date)
        )
    `;

    db.query(query, (err) => {
        if (err) {
            console.log("Expenses Table Creation Failed");
            console.log(err);
        } else {
            console.log("Expenses Table Ready");
        }
    });
};

export { expensesFields, createExpensesTable };