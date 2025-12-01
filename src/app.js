import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/customers", customerRoutes);
app.use("/admin", adminRoutes);

// TEST route
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Wholesaler API is running.",
    });
});

// Export app for server or tests
export default app;
