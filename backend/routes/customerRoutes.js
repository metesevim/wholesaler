import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, addItemsToCustomerInventory,
    removeItemsFromCustomerInventory, getCustomerInventory} from "../controllers/customerController.js";

const router = express.Router();

// Customer Management
router.get("/", authJWT, requirePermission("view_customers"), getAllCustomers);
router.post("/", authJWT, requirePermission("manage_customers"), createCustomer);
router.get("/:id", authJWT, requirePermission("view_customers"), getCustomerById);
router.put("/:id", authJWT, requirePermission("manage_customers"), updateCustomer);
router.delete("/:id", authJWT, requirePermission("manage_customers"), deleteCustomer);

// Customer Inventory Management
router.get("/:id/inventory", authJWT, requirePermission("view_customers"), getCustomerInventory);
router.post("/:id/inventory/items", authJWT, requirePermission("manage_customers"), addItemsToCustomerInventory);
router.delete("/:id/inventory/items", authJWT, requirePermission("manage_customers"), removeItemsFromCustomerInventory);

export default router;
