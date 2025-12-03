import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// use shared prisma client
import prisma from "../prisma/client.js";
import { PERMISSIONS } from "../constants/permissions.js";

// REGISTER
export const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username  || !password || !role)
            return res.status(400).json({ error: "Please enter all required fields." });

        // Checking userName
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: "User already exists." });
        }

        // Checking role
        if (!["Admin", "Employee"].includes(role)) {
            return res.status(400).json({ error: "Role must be Admin or Employee." });
        }

        // Password hashing
        const hashedPass = await bcrypt.hash(password, 10);

        // By default: Admin gets all permissions, Employee gets none.
        const defaultPermissions = role === "Admin" ? PERMISSIONS : [];

        // 2) Saving user to Prisma (DB)
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPass,
                role,
                permissions: defaultPermissions, // assumes user model has a string[] field 'permissions'
            },
        });

        // 3) Output
        res.json({ message: "User created.", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// NEW: Admin creates an Employee account
export const createEmployee = async (req, res) => {
    try {
        const { username, password, permissions, iban } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "username and password are required." });
        }

        // Check username uniqueness
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: "User already exists." });
        }

        // Validate optional permissions array if provided
        let finalPermissions = [];
        if (permissions !== undefined) {
            if (!Array.isArray(permissions)) {
                return res.status(400).json({ error: "permissions must be an array if provided." });
            }
            const invalid = permissions.filter((p) => !PERMISSIONS.includes(p));
            if (invalid.length) {
                return res.status(400).json({ error: `Invalid permissions: ${invalid.join(", ")}` });
            }
            finalPermissions = permissions;
        }

        // Hash password
        const hashedPass = await bcrypt.hash(password, 10);

        // Create employee with role fixed to 'Employee'
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPass,
                role: "Employee",
                permissions: finalPermissions,
                iban,
            },
        });

        res.status(201).json({ message: "Employee created.", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1) Checking if username exists
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) return res.status(400).json({ error: "User not found." });

        // 2) Checking if pass is true
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ error: "Wrong password." });

        // 3) Creating admin token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Expires after 1 day.
        );

        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ADMIN: set permissions for a given user (Admin-only route)
export const setPermissions = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const { permissions } = req.body; // expect array of permission keys

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ error: "permissions must be an array." });
        }

        // Validate provided permissions
        const invalid = permissions.filter((p) => !PERMISSIONS.includes(p));
        if (invalid.length) {
            return res.status(400).json({ error: `Invalid permissions: ${invalid.join(", ")}` });
        }

        // Update user
        const updated = await prisma.user.update({
            where: { id: targetUserId },
            data: { permissions },
        });

        res.json({ message: "Permissions updated.", user: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE USER INFORMATION =============
/**
 * Update user information (Admin only)
 * Can update IBAN and other user details
 */
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { iban } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Update user information
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                ...(iban && { iban }),
            },
        });

        res.json({
            message: "User information updated successfully.",
            user: updatedUser,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
