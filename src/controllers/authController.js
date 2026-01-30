import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// use shared prisma client
import prisma from "../../prisma/client.js";
import { PERMISSIONS } from "../constants/permissions.js";

//Register
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

        // 3) Output (exclude password from response)
        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: "User created.", user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Admin creates an Employee account
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

        // Exclude password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ message: "Employee created.", user: userWithoutPassword });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Login
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

        // Return token and user data (exclude password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: "Login successful",
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//Set permissions for a given user (Admin-only route)
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

//Update user information (Admin-only route)
/**
 * Update user information - supports username, password, and iban
 * Admin only
 */
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, password, iban } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // At least one field must be provided
        if (!username && !password && !iban) {
            return res.status(400).json({ error: "At least one field (username, password, or iban) must be provided." });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // If username is being updated, check for uniqueness
        if (username && username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUser) {
                return res.status(400).json({ error: "Username already exists." });
            }
        }

        // Prepare update data
        const updateData = {};

        if (username) {
            updateData.username = username;
        }

        if (password) {
            // Hash the new password
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (iban) {
            updateData.iban = iban;
        }

        // Update user information
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: updateData,
        });

        res.json({
            message: "User information updated successfully.",
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                iban: updatedUser.iban,
                createdAt: updatedUser.createdAt,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user profile (authenticated users can update their own profile)
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT middleware
        const { username, email, fullName, currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!username || !email || !fullName) {
            return res.status(400).json({ error: "Username, email, and full name are required." });
        }

        // Check if username already exists (if changing username)
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(400).json({ error: "User not found." });
        }

        // If changing username, check uniqueness
        if (username !== user.username) {
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing) {
                return res.status(400).json({ error: "Username already exists." });
            }
        }

        // If password change requested, validate current password
        let updateData = {
            username,
            email,
            name: fullName,
        };

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: "Current password is required to set a new password." });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect." });
            }

            // Hash new password and update data
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Return updated user (exclude password)
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json({
            message: "Profile updated successfully.",
            user: userWithoutPassword
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
