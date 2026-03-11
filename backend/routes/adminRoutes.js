import express from "express";
import { authJWT, requireRole } from "../middleware/authMiddleware.js";
import { setPermissions, createEmployee, updateUser, getAllEmployees, getEmployeeById, deleteEmployee } from "../controllers/authController.js";

const router = express.Router();

// Admin Management Routes
router.get("/users", authJWT, requireRole("Admin"), getAllEmployees);
router.get("/users/:id", authJWT, requireRole("Admin"), getEmployeeById);
router.post("/users", authJWT, requireRole("Admin"), createEmployee);
router.put("/users/:id/permissions", authJWT, requireRole("Admin"), setPermissions);
router.put("/users/:userId", authJWT, requireRole("Admin"), updateUser);
router.delete("/users/:id", authJWT, requireRole("Admin"), deleteEmployee);

export default router;
