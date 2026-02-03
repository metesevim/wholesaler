import express from "express";
import { register, login, updateProfile } from "../controllers/authController.js";
import { authJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
router.post("/register", register);

/**
router.post("/login", login);

/**
router.put("/profile", authJWT, updateProfile);

export default router;

