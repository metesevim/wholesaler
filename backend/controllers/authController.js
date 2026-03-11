import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// use shared prisma client
import prisma from "../prisma/client.js";
import { PERMISSIONS } from "../constants/permissions.js";
import { logAudit } from "../utils/auditLogger.js";

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
        const { username, password, permissions, iban, email, fullName, phone, nationalId, address } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "username and password are required." });
        }

        // Check username uniqueness
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ error: "User already exists." });
        }

        // Check email uniqueness if provided
        if (email) {
            const existingEmail = await prisma.user.findUnique({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ error: "Email already in use." });
            }
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
                iban: iban || null,
                email: email || null,
                name: fullName || null,
                phone: phone || null,
                nationalId: nationalId || null,
                address: address || null,
            },
        });

        // Exclude password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ message: "Employee created.", user: userWithoutPassword });

        // Audit trail
        await logAudit({
            action: 'CREATE',
            entityType: 'EMPLOYEE',
            entityId: user.id,
            entityName: user.username,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { role: 'Employee', permissions: finalPermissions },
        });
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

        // Audit trail
        await logAudit({
            action: 'UPDATE',
            entityType: 'EMPLOYEE',
            entityId: typeof targetUserId === 'string' ? parseInt(targetUserId) : targetUserId,
            entityName: updated.username,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { action: 'permissions_changed', newPermissions: permissions },
        });
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
        const { username, password, iban, email, fullName, phone, nationalId, address } = req.body;

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

        // If username is being updated, check for uniqueness
        if (username && username !== user.username) {
            const existingUser = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUser) {
                return res.status(400).json({ error: "Username already exists." });
            }
        }

        // If email is being updated, check for uniqueness
        if (email && email !== user.email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });
            if (existingEmail) {
                return res.status(400).json({ error: "Email already in use." });
            }
        }

        // Prepare update data
        const updateData = {};

        if (username !== undefined) updateData.username = username;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (iban !== undefined) updateData.iban = iban || null;
        if (email !== undefined) updateData.email = email || null;
        if (fullName !== undefined) updateData.name = fullName || null;
        if (phone !== undefined) updateData.phone = phone || null;
        if (nationalId !== undefined) updateData.nationalId = nationalId || null;
        if (address !== undefined) updateData.address = address || null;

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
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
                nationalId: updatedUser.nationalId,
                address: updatedUser.address,
                role: updatedUser.role,
                iban: updatedUser.iban,
                permissions: updatedUser.permissions,
                createdAt: updatedUser.createdAt,
            },
        });

        // Audit trail
        await logAudit({
            action: 'UPDATE',
            entityType: 'EMPLOYEE',
            entityId: updatedUser.id,
            entityName: updatedUser.username,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { fieldsUpdated: Object.keys(updateData).filter(k => k !== 'password') },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user profile (authenticated users can update their own profile)
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT middleware
        const { username, email, fullName, iban, currentPassword, newPassword } = req.body;

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
            ...(iban !== undefined && { iban }),
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

// ============= GET ALL EMPLOYEES =============
/**
 * List all users with role Employee (Admin-only)
 */
export const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany({
            where: { role: "Employee" },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                nationalId: true,
                address: true,
                role: true,
                permissions: true,
                iban: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            message: "Employees retrieved successfully.",
            employees,
            total: employees.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET EMPLOYEE BY ID =============
/**
 * Get a single employee by ID (Admin-only)
 */
export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                phone: true,
                nationalId: true,
                address: true,
                role: true,
                permissions: true,
                iban: true,
                createdAt: true,
            },
        });

        if (!employee) {
            return res.status(404).json({ error: "Employee not found." });
        }

        res.json({
            message: "Employee retrieved successfully.",
            employee,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= DELETE EMPLOYEE =============
/**
 * Delete an employee account (Admin-only, cannot delete Admin accounts)
 */
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        });

        if (!user) {
            return res.status(404).json({ error: "Employee not found." });
        }

        if (user.role === "Admin") {
            return res.status(400).json({ error: "Cannot delete an Admin account." });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            message: "Employee deleted successfully.",
        });

        // Audit trail
        await logAudit({
            action: 'DELETE',
            entityType: 'EMPLOYEE',
            entityId: parseInt(id),
            entityName: user.username,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { email: user.email, name: user.name },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

