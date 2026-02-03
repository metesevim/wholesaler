import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, addItemsToCustomerInventory,
    removeItemsFromCustomerInventory, getCustomerInventory} from "../controllers/customerController.js";

const router = express.Router();

//Customer Management

/**
router.get("/", authJWT, requirePermission("VIEW_CUSTOMERS"), getAllCustomers);

/**
router.post("/", authJWT, requirePermission("CREATE_CUSTOMER"), createCustomer);

/**
router.get("/:id", authJWT, requirePermission("VIEW_CUSTOMERS"), getCustomerById);

/**
router.put("/:id", authJWT, requirePermission("EDIT_CUSTOMERS"), updateCustomer);

/**
router.delete("/:id", authJWT, requirePermission("EDIT_CUSTOMERS"), deleteCustomer);

//Customer Inventory Management

/**
router.get("/:id/inventory", authJWT, requirePermission("VIEW_CUSTOMERS"), getCustomerInventory);

/**
router.post("/:id/inventory/items", authJWT, requirePermission("EDIT_CUSTOMERS"), addItemsToCustomerInventory);

/**
router.delete("/:id/inventory/items", authJWT, requirePermission("EDIT_CUSTOMERS"), removeItemsFromCustomerInventory);

export default router;
