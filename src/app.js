import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import customerRoutes from "./routes/customerRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { specs, swaggerUi } from "./swagger.js";
import prisma from "../prisma/client.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { swaggerOptions: { persistAuthorization: true } }));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
    res.json(specs);
});

// Routes
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/orders", orderRoutes);
app.use("/providers", providerRoutes);
app.use("/admin", adminRoutes);

// TEST route
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
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
