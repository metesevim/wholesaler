import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getCustomerOrders,
    getOrderSummary,
    addItemToOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// ============= ORDER MANAGEMENT =============

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve all orders, optionally filtered by status or customer. Requires VIEW_ORDERS permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *         description: Filter by order status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", authJWT, requirePermission("VIEW_ORDERS"), getAllOrders);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Create an order from customer inventory items. Automatically reduces admin inventory quantities. Requires CREATE_ORDER permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, items]
 *             properties:
 *               customerId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [adminItemId, quantity, unit]
 *                   properties:
 *                     adminItemId:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                       enum: [piece, kg, liter]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer or item not found
 */
router.post("/", authJWT, requirePermission("CREATE_ORDER"), createOrder);

/**
 * @swagger
 * /orders/summary:
 *   get:
 *     summary: Get order summary statistics
 *     description: Get overview statistics about all orders. Requires VIEW_ORDERS permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order summary statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", authJWT, requirePermission("VIEW_ORDERS"), getOrderSummary);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order with all items.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get("/:id", authJWT, requirePermission("VIEW_ORDERS"), getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     description: Change the status of an order. Requires EDIT_ORDERS permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.put("/:id/status", authJWT, requirePermission("EDIT_ORDERS"), updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     description: Cancel an order and restore inventory quantities. Requires EDIT_ORDERS permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Cannot cancel order
 *       404:
 *         description: Order not found
 */
router.post("/:id/cancel", authJWT, requirePermission("EDIT_ORDERS"), cancelOrder);

/**
 * @swagger
 * /orders/{id}/items:
 *   post:
 *     summary: Add item to pending order
 *     description: Add another item to an order before it's confirmed. Requires EDIT_ORDERS permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adminItemId, quantity, unit]
 *             properties:
 *               adminItemId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [piece, kg, liter]
 *     responses:
 *       200:
 *         description: Item added
 *       400:
 *         description: Bad request or insufficient stock
 *       404:
 *         description: Order or item not found
 */
router.post("/:id/items", authJWT, requirePermission("EDIT_ORDERS"), addItemToOrder);

/**
 * @swagger
 * /orders/customer/{customerId}:
 *   get:
 *     summary: Get customer orders
 *     description: Get all orders for a specific customer. Optionally filter by status. Requires VIEW_ORDERS permission.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Customer orders
 *       404:
 *         description: Customer not found
 */
router.get("/customer/:customerId", authJWT, requirePermission("VIEW_ORDERS"), getCustomerOrders);

export default router;

