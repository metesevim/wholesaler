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
router.post("/", authJWT, requirePermission("manage_providers"), createProvider);
router.get("/", authJWT, getAllProviders);
router.get("/:id", authJWT, getProviderById);
router.put("/:id", authJWT, requirePermission("manage_providers"), updateProvider);
router.delete("/:id", authJWT, requirePermission("manage_providers"), deleteProvider);

export default router;
