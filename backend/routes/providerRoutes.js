import express from "express";
import { authJWT, requirePermission } from "../middleware/authMiddleware.js";
import {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
} from "../controllers/providerController.js";

const router = express.Router();

// Provider Management

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Get all providers
 *     description: Retrieve all providers. Requires VIEW_PROVIDERS permission.
 *     tags:
 *       - Providers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all providers
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get("/", authJWT, requirePermission("VIEW_PROVIDERS"), getAllProviders);

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Create a new provider
 *     description: Create a new provider. Requires CREATE_PROVIDER permission.
 *     tags:
 *       - Providers
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
 *               iban:
 *                 type: string
 *     responses:
 *       201:
 *         description: Provider created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authJWT, requirePermission("CREATE_PROVIDER"), createProvider);

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Get provider by ID
 *     description: Retrieve a specific provider. Requires VIEW_PROVIDERS permission.
 *     tags:
 *       - Providers
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
 *         description: Provider details
 *       404:
 *         description: Provider not found
 */
router.get("/:id", authJWT, requirePermission("VIEW_PROVIDERS"), getProviderById);

/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     summary: Update provider
 *     description: Update provider details. Requires EDIT_PROVIDER permission.
 *     tags:
 *       - Providers
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
 *               iban:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider updated
 *       404:
 *         description: Provider not found
 */
router.put("/:id", authJWT, requirePermission("EDIT_PROVIDER"), updateProvider);

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: Delete provider
 *     description: Delete a provider. Requires DELETE_PROVIDER permission.
 *     tags:
 *       - Providers
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
 *         description: Provider deleted
 *       404:
 *         description: Provider not found
 */
router.delete("/:id", authJWT, requirePermission("DELETE_PROVIDER"), deleteProvider);

export default router;
