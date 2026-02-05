import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, deleteOrder,
    getCustomerOrders, getOrderSummary, addItemToOrder, getCustomerAvailableItems} from "../controllers/orderController.js";

const router = express.Router();

// Order Management
router.get("/", authJWT, requirePermission("view_orders"), getAllOrders);
router.post("/", authJWT, requirePermission("manage_orders"), createOrder);
router.get("/summary", authJWT, requirePermission("view_orders"), getOrderSummary);
router.get("/:id", authJWT, requirePermission("view_orders"), getOrderById);
router.put("/:id/status", authJWT, requirePermission("manage_orders"), updateOrderStatus);
router.post("/:id/cancel", authJWT, requirePermission("manage_orders"), cancelOrder);
router.delete("/:id", authJWT, requirePermission("manage_orders"), deleteOrder);
router.post("/:id/items", authJWT, requirePermission("manage_orders"), addItemToOrder);
router.get("/customer/:customerId", authJWT, requirePermission("view_orders"), getCustomerOrders);
router.get("/customer/:customerId/available-items", authJWT, requirePermission("view_orders"), getCustomerAvailableItems);

export default router;

