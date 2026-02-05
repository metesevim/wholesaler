import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

// Get all categories (public, no auth needed for dropdown)
router.get("/", getAllCategories);

// Admin only operations
router.post("/", authJWT, requirePermission("manage_inventory"), createCategory);
router.put("/:id", authJWT, requirePermission("manage_inventory"), updateCategory);
router.delete("/:id", authJWT, requirePermission("manage_inventory"), deleteCategory);

export default router;
