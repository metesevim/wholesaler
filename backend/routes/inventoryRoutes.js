import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {createAdminInventoryItem, getAllAdminInventoryItems, getAdminInventoryItemById,
    updateAdminInventoryItem, deleteAdminInventoryItem, adjustInventoryQuantity,
    getInventorySummary} from "../controllers/inventoryController.js";

const router = express.Router();

//Admin Inventory Management

/**
 * @swagger
 * /inventory/items:
 *   get:
 *     summary: Get all admin inventory items
 *     description: Retrieve all items in admin inventory. Requires VIEW_PRODUCTS permission.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/items", authJWT, requirePermission("VIEW_PRODUCTS"), getAllAdminInventoryItems);

/**
 * @swagger
 * /inventory/items:
 *   post:
 *     summary: Create inventory item
 *     description: Create a new item in admin inventory. Requires CREATE_PRODUCT permission.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *                 enum: [piece, kg, liter]
 *               imageUrl:
 *                 type: string
 *               pricePerUnit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/items", authJWT, requirePermission("CREATE_PRODUCT"), createAdminInventoryItem);

/**
 * @swagger
 * /inventory/items/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     description: Retrieve a specific inventory item.
 *     tags:
 *       - Inventory
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
 *         description: Inventory item
 *       404:
 *         description: Item not found
 */
router.get("/items/:id", authJWT, requirePermission("VIEW_PRODUCTS"), getAdminInventoryItemById);

/**
 * @swagger
 * /inventory/items/{id}:
 *   put:
 *     summary: Update inventory item
 *     description: Update item details. Requires EDIT_PRODUCT permission.
 *     tags:
 *       - Inventory
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unit:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               pricePerUnit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Item not found
 */
router.put("/items/:id", authJWT, requirePermission("EDIT_PRODUCT"), updateAdminInventoryItem);

/**
 * @swagger
 * /inventory/items/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     description: Delete an item from inventory. Requires EDIT_PRODUCT permission.
 *     tags:
 *       - Inventory
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
 *         description: Item deleted
 *       400:
 *         description: Item in use
 *       404:
 *         description: Item not found
 */
router.delete("/items/:id", authJWT, requirePermission("EDIT_PRODUCT"), deleteAdminInventoryItem);

/**
 * @swagger
 * /inventory/items/{id}/adjust:
 *   post:
 *     summary: Adjust inventory quantity
 *     description: Add or remove stock from an item. Requires EDIT_PRODUCT permission.
 *     tags:
 *       - Inventory
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
 *             required: [adjustment]
 *             properties:
 *               adjustment:
 *                 type: number
 *                 description: Positive to add, negative to remove
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quantity adjusted
 *       400:
 *         description: Insufficient stock
 */
router.post("/items/:id/adjust", authJWT, requirePermission("EDIT_PRODUCT"), adjustInventoryQuantity);

/**
 * @swagger
 * /inventory/summary:
 *   get:
 *     summary: Get inventory summary
 *     description: Get overview of all inventory with low stock alerts. Requires VIEW_PRODUCTS permission.
 *     tags:
 *       - Inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary
 *       401:
 *         description: Unauthorized
 */
router.get("/summary", authJWT, requirePermission("VIEW_PRODUCTS"), getInventorySummary);

export default router;

