const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./prisma/client");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Basit test endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Wholesaler API is running 🚀" });
});

app.get("/db-test", async (req, res) => {
    try {
        const users = await prisma.user.findMany(); // tablo boşsa bile çalışır
        res.json({
            status: "ok",
            userCount: users.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", message: "DB error" });
    }
});

import customerRoutes from "./routes/customerRoutes.js";

app.use("/customers", customerRoutes);


module.exports = app;
