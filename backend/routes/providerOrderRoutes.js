import express from "express";
import {
    getAllProviderOrders,
    getProviderOrderById,
    checkAndCreateProviderOrders,
    addItemToProviderOrder,
    removeItemFromProviderOrder,
    updateProviderOrderStatus,
    sendProviderOrderEmail,
    deleteProviderOrder,
} from "../controllers/providerOrderController.js";
import { authJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authJWT);

// Get all provider orders
router.get("/", getAllProviderOrders);

// Check inventory and create orders for low stock items
router.post("/check-stock", checkAndCreateProviderOrders);

// Get single provider order
router.get("/:id", getProviderOrderById);

// Add item to provider order
router.post("/:id/items", addItemToProviderOrder);

// Remove item from provider order
router.delete("/:id/items/:itemId", removeItemFromProviderOrder);

// Update provider order status
router.patch("/:id/status", updateProviderOrderStatus);

// Send order email to provider
router.post("/:id/send-email", sendProviderOrderEmail);

// Delete provider order
router.delete("/:id", deleteProviderOrder);

export default router;

