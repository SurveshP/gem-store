import express from "express";
import cors from "cors";
import path from "path";

import { createCustomerTable } from "./models/customerModel.js";
import { createItemTable } from "./models/itemModel.js"; 
import { createStockTable } from "./models/stockModel.js";
import { createStockGroupTable } from "./models/stockGroupModel.js";

import customerRoutes from "./routes/customerRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";  
import stockRoutes from "./routes/stockRoutes.js";   

const app = express();

app.use(cors());
app.use(express.json());

// Uploaded files serve karo
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CREATE TABLE
createCustomerTable();
createItemTable();    
createStockTable();   
createStockGroupTable();      

// ROUTES
app.use("/api/customers", customerRoutes);
app.use("/api/items", itemRoutes); 
app.use("/api/stock", stockRoutes);   

app.get("/", (req, res) => {
    res.send("Jewellery Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});