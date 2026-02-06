import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import providerOrderRoutes from "./routes/providerOrderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import prisma from "./prisma/client.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Routes
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/orders", orderRoutes);
app.use("/providers", providerRoutes);
app.use("/provider-orders", providerOrderRoutes);
app.use("/categories", categoryRoutes);
app.use("/admin", adminRoutes);

// TEST route
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "gayet iyi",
        message: "Wholesaler API is running.",
        prisma: prisma ? "connected" : "disconnected",
    });
});

// Test Prisma connection
app.get("/test-db", async (req, res) => {
    try {
        if (!prisma) {
            return res.status(500).json({ error: "Prisma not initialized" });
        }
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        res.json({ message: "Database connected", result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export app for server or tests
export default app;
