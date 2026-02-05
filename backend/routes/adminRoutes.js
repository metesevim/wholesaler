import express from "express";
import { authJWT, requireRole } from "../middleware/authMiddleware.js";
import { setPermissions, createEmployee, updateUser } from "../controllers/authController.js";

const router = express.Router();

// Admin Management Routes
router.post("/users", authJWT, requireRole("Admin"), createEmployee);
router.put("/users/:id/permissions", authJWT, requireRole("Admin"), setPermissions);
router.put("/users/:userId", authJWT, requireRole("Admin"), updateUser);

export default router;
