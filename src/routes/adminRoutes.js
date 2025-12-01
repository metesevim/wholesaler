import express from "express";
import { authJWT, requireRole } from "../middleware/authMiddleware.js";
import { setPermissions, createEmployee } from "../controllers/authController.js";

const router = express.Router();

// Admin updates a user's permissions
router.put("/users/:id/permissions", authJWT, requireRole("Admin"), setPermissions);

// Admin creates a new Employee
router.post("/users", authJWT, requireRole("Admin"), createEmployee);

// Optionally add other admin endpoints here...

export default router;
