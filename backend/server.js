import express from "express";
import cors from "cors";
import path from "path";

import { createCustomerTable } from "./models/customerModel.js";
import customerRoutes from "./routes/customerRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Uploaded files serve karo
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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