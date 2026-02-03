import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, deleteOrder,
    getCustomerOrders, getOrderSummary, addItemToOrder, getCustomerAvailableItems} from "../controllers/orderController.js";

const router = express.Router();

//Order Management

/**
router.get("/", authJWT, requirePermission("VIEW_ORDERS"), getAllOrders);

/**
router.post("/", authJWT, requirePermission("CREATE_ORDER"), createOrder);

/**
router.get("/summary", authJWT, requirePermission("VIEW_ORDERS"), getOrderSummary);

/**
router.get("/:id", authJWT, requirePermission("VIEW_ORDERS"), getOrderById);

/**
router.put("/:id/status", authJWT, requirePermission("EDIT_ORDERS"), updateOrderStatus);

/**
router.post("/:id/cancel", authJWT, requirePermission("EDIT_ORDERS"), cancelOrder);

/**
router.delete("/:id", authJWT, requirePermission("EDIT_ORDERS"), deleteOrder);

/**
router.post("/:id/items", authJWT, requirePermission("EDIT_ORDERS"), addItemToOrder);

/**
router.get("/customer/:customerId", authJWT, requirePermission("VIEW_ORDERS"), getCustomerOrders);

/**
router.get("/customer/:customerId/available-items", authJWT, requirePermission("VIEW_ORDERS"), getCustomerAvailableItems);

export default router;

