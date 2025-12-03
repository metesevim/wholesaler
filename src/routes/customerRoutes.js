import express from "express";
import { authJWT, requireRole, requirePermission } from "../middleware/authMiddleware.js";
import {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    addItemsToCustomerInventory,
    removeItemsFromCustomerInventory,
    getCustomerInventory,
} from "../controllers/customerController.js";

const router = express.Router();

// ============= CUSTOMER MANAGEMENT =============

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     description: Retrieve all customers with their inventories. Requires VIEW_CUSTOMERS permission.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get("/", authJWT, requirePermission("VIEW_CUSTOMERS"), getAllCustomers);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     description: Create a new customer with optional items assigned to their inventory. Requires CREATE_CUSTOMER permission.
 *     tags:
 *       - Customers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Admin inventory item IDs to assign to customer
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authJWT, requirePermission("CREATE_CUSTOMER"), createCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     description: Retrieve a specific customer with their inventory.
 *     tags:
 *       - Customers
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
 *         description: Customer retrieved
 *       404:
 *         description: Customer not found
 */
router.get("/:id", authJWT, requirePermission("VIEW_CUSTOMERS"), getCustomerById);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update customer
 *     description: Update customer information.
 *     tags:
 *       - Customers
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
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Customer not found
 */
router.put("/:id", authJWT, requirePermission("EDIT_CUSTOMERS"), updateCustomer);

// ============= CUSTOMER INVENTORY MANAGEMENT =============

/**
 * @swagger
 * /customers/{id}/inventory:
 *   get:
 *     summary: Get customer inventory
 *     description: Get items in customer's inventory.
 *     tags:
 *       - Customers
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
 *         description: Customer inventory
 *       404:
 *         description: Customer not found
 */
router.get("/:id/inventory", authJWT, requirePermission("VIEW_CUSTOMERS"), getCustomerInventory);

/**
 * @swagger
 * /customers/{id}/inventory/items:
 *   post:
 *     summary: Add items to customer inventory
 *     description: Add items from admin inventory to customer inventory.
 *     tags:
 *       - Customers
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
 *             required: [itemIds]
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Items added
 *       400:
 *         description: Bad request
 *       404:
 *         description: Customer not found
 */
router.post("/:id/inventory/items", authJWT, requirePermission("EDIT_CUSTOMERS"), addItemsToCustomerInventory);

/**
 * @swagger
 * /customers/{id}/inventory/items:
 *   delete:
 *     summary: Remove items from customer inventory
 *     description: Remove items from customer inventory.
 *     tags:
 *       - Customers
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
 *             required: [itemIds]
 *             properties:
 *               itemIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Items removed
 *       400:
 *         description: Bad request
 */
router.delete("/:id/inventory/items", authJWT, requirePermission("EDIT_CUSTOMERS"), removeItemsFromCustomerInventory);

export default router;
