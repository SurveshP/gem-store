import express from "express";
import cors from "cors";
import path from "path";

import { createCustomerTable } from "./models/customerModel.js";
import { createItemTable } from "./models/itemModel.js";
import { createStockTable } from "./models/stockModel.js";
import { createStockGroupTable } from "./models/stockGroupModel.js";
import { createItemsBillingTable } from "./models/itemsBillingModel.js";  // 👈 NAYA
import { createBillingTable } from "./models/billingModel.js";            // 👈 NAYA

import customerRoutes from "./routes/customerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import itemsBillingRoutes from "./routes/itemsBillingRoutes.js";          // 👈 NAYA
import billingRoutes from "./routes/billingRoutes.js";                    // 👈 NAYA

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CREATE TABLES
createCustomerTable();
createItemTable();
createStockTable();
createStockGroupTable();
createItemsBillingTable();   // 👈 NAYA
createBillingTable();        // 👈 NAYA

// ROUTES
app.use("/api/customers", customerRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/itemsBilling", itemsBillingRoutes);   // 👈 NAYA
app.use("/api/billing", billingRoutes);             // 👈 NAYA

app.get("/", (req, res) => {
    res.send("Jewellery Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});