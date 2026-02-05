import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createAdminInventoryItem, getAllAdminInventoryItems, getAdminInventoryItemById,
    updateAdminInventoryItem, deleteAdminInventoryItem, adjustInventoryQuantity,
    getInventorySummary} from "../controllers/inventoryController.js";

const router = express.Router();

// Admin Inventory Management
router.get("/items", authJWT, requirePermission("view_inventory"), getAllAdminInventoryItems);
router.post("/items", authJWT, requirePermission("manage_inventory"), createAdminInventoryItem);
router.get("/items/:id", authJWT, requirePermission("view_inventory"), getAdminInventoryItemById);
router.put("/items/:id", authJWT, requirePermission("manage_inventory"), updateAdminInventoryItem);
router.delete("/items/:id", authJWT, requirePermission("manage_inventory"), deleteAdminInventoryItem);
router.post("/items/:id/adjust", authJWT, requirePermission("manage_inventory"), adjustInventoryQuantity);
router.get("/summary", authJWT, requirePermission("view_inventory"), getInventorySummary);

export default router;

