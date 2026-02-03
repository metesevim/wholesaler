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

