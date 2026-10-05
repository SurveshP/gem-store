import express from "express";
import cors from "cors";

import { createCustomerTable } from "./models/customerModel.js";
import customerRoutes from "./routes/customerRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 Uploads folder ko static serve karo
// Isse frontend se http://localhost:5000/uploads/xyz.jpg access kar sakte ho
app.use("/uploads", express.static("uploads"));

// CREATE TABLE
createCustomerTable();

// ROUTES
app.use("/api/customers", customerRoutes);

app.get("/", (req, res) => {
    res.send("Jewellery Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});