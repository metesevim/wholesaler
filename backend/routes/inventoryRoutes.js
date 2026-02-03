import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createAdminInventoryItem, getAllAdminInventoryItems, getAdminInventoryItemById,
    updateAdminInventoryItem, deleteAdminInventoryItem, adjustInventoryQuantity,
    getInventorySummary} from "../controllers/inventoryController.js";

const router = express.Router();

//Admin Inventory Management

/**
router.get("/items", authJWT, requirePermission("VIEW_PRODUCTS"), getAllAdminInventoryItems);

/**
router.post("/items", authJWT, requirePermission("CREATE_PRODUCT"), createAdminInventoryItem);

/**
router.get("/items/:id", authJWT, requirePermission("VIEW_PRODUCTS"), getAdminInventoryItemById);

/**
router.put("/items/:id", authJWT, requirePermission("EDIT_PRODUCT"), updateAdminInventoryItem);

/**
router.delete("/items/:id", authJWT, requirePermission("EDIT_PRODUCT"), deleteAdminInventoryItem);

/**
router.post("/items/:id/adjust", authJWT, requirePermission("EDIT_PRODUCT"), adjustInventoryQuantity);

/**
router.get("/summary", authJWT, requirePermission("VIEW_PRODUCTS"), getInventorySummary);

export default router;

