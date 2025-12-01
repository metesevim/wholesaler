import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Public registration (could be disabled in production)
router.post("/register", register);

// Login -> returns JWT
router.post("/login", login);

export default router;

