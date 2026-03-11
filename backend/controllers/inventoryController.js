import prisma from "../prisma/client.js";
import { logAudit } from "../utils/auditLogger.js";

// ============= CREATE ADMIN INVENTORY ITEM =============
/**
 * Admin/Employee creates an item in admin inventory
 * Includes name, description, quantity, unit, image, price, and low stock alert threshold
 */
export const createAdminInventoryItem = async (req, res) => {
    try {
        const { name, description, quantity, unit, imageUrl, pricePerUnit, minimumCapacity, maximumCapacity, providerId, productionDate, expiryDate, categoryId, productCode } = req.body;

        console.log('Create item request received:', { name, description, quantity, unit, imageUrl, pricePerUnit, minimumCapacity, maximumCapacity, providerId, productionDate, expiryDate, categoryId, productCode });

        if (!name) {
            return res.status(400).json({ error: "Item name is required." });
        }

        // Get or create admin inventory for the admin user
        let adminInventory = await prisma.adminInventory.findFirst({
            where: { user: { role: "Admin" } },
        });

        if (!adminInventory) {
            // Create admin inventory linked to first admin user
            const adminUser = await prisma.user.findFirst({
                where: { role: "Admin" },
            });

            if (!adminUser) {
                return res.status(400).json({ error: "No admin user found to create inventory for." });
            }

            adminInventory = await prisma.adminInventory.create({
                data: { userId: adminUser.id },
            });
        }

        // Create inventory item
        const item = await prisma.adminInventoryItem.create({
            data: {
                adminInventoryId: adminInventory.id,
                name,
                description,
                productCode,
                quantity: quantity || 0,
                unit: unit || "piece",
                imageUrl,
                pricePerUnit,
                minimumCapacity: minimumCapacity || 20,
                maximumCapacity: maximumCapacity || 100,
                providerId: providerId ? parseInt(providerId) : null,
                productionDate: productionDate ? new Date(productionDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                categoryId: categoryId ? parseInt(categoryId) : null,
            },
            include: {
                provider: true,
                category: true,
            },
        });

        res.status(201).json({
            message: "Inventory item created successfully.",
            item,
        });

        // Audit trail
        await logAudit({
            action: 'CREATE',
            entityType: 'ITEM',
            entityId: item.id,
            entityName: item.name,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: {
                productCode: productCode,
                unit: unit,
                category: item.category?.name,
                provider: item.provider?.name,
                quantity: quantity,
                pricePerUnit: pricePerUnit,
                minimumCapacity: minimumCapacity,
                maximumCapacity: maximumCapacity,
                productionDate: productionDate,
                expiryDate: expiryDate
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET ALL ADMIN INVENTORY ITEMS =============
export const getAllAdminInventoryItems = async (req, res) => {
    try {
        const items = await prisma.adminInventoryItem.findMany({
            include: {
                provider: true,
                category: true,
                customerItems: {
                    include: {
                        customerInventory: {
                            include: {
                                customer: true,
                            },
                        },
                    },
                },
            },
        });

        res.json({
            message: "Admin inventory items retrieved successfully.",
            items,
            total: items.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET SINGLE ADMIN INVENTORY ITEM =============
export const getAdminInventoryItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await prisma.adminInventoryItem.findUnique({
            where: { id: parseInt(id) },
            include: {
                provider: true,
                category: true,
                customerItems: {
                    include: {
                        customerInventory: {
                            include: {
                                customer: true,
                            },
                        },
                    },
                },
            },
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found." });
        }

        res.json({
            message: "Admin inventory item retrieved successfully.",
            item,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAdminInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, quantity, unit, imageUrl, pricePerUnit, minimumCapacity, maximumCapacity, providerId, productionDate, expiryDate, categoryId, productCode } = req.body;

        console.log('Update item request received:', { id, name, description, quantity, unit, imageUrl, pricePerUnit, minimumCapacity, maximumCapacity, providerId, productionDate, expiryDate, categoryId, productCode });

        // Fetch current state for audit trail
        const beforeItem = await prisma.adminInventoryItem.findUnique({
            where: { id: parseInt(id) },
            include: { provider: true, category: true },
        });

        const item = await prisma.adminInventoryItem.update({
            where: { id: parseInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(productCode !== undefined && { productCode }),
                ...(quantity !== undefined && { quantity }),
                ...(unit !== undefined && { unit }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(pricePerUnit !== undefined && { pricePerUnit }),
                ...(minimumCapacity !== undefined && { minimumCapacity }),
                ...(maximumCapacity !== undefined && { maximumCapacity }),
                ...(providerId !== undefined && { providerId: providerId ? parseInt(providerId) : null }),
                ...(productionDate !== undefined && { productionDate: productionDate ? new Date(productionDate) : null }),
                ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
                ...(categoryId !== undefined && { categoryId: categoryId ? parseInt(categoryId) : null }),
            },
            include: {
                provider: true,
                category: true,
            },
        });

        res.json({
            message: "Inventory item updated successfully.",
            item,
        });

        // Audit trail
        const changes = {};
        if (beforeItem) {
            if (name !== undefined && name !== beforeItem.name) changes.name = { from: beforeItem.name, to: name };
            if (quantity !== undefined && quantity !== beforeItem.quantity) changes.quantity = { from: beforeItem.quantity, to: quantity };
            if (pricePerUnit !== undefined && pricePerUnit !== beforeItem.pricePerUnit) changes.pricePerUnit = { from: beforeItem.pricePerUnit, to: pricePerUnit };
            if (description !== undefined && description !== beforeItem.description) changes.description = { from: beforeItem.description, to: description };
            if (unit !== undefined && unit !== beforeItem.unit) changes.unit = { from: beforeItem.unit, to: unit };
            if (imageUrl !== undefined && imageUrl !== beforeItem.imageUrl) changes.imageUrl = { from: beforeItem.imageUrl, to: imageUrl };
            if (minimumCapacity !== undefined && minimumCapacity !== beforeItem.minimumCapacity) changes.minimumCapacity = { from: beforeItem.minimumCapacity, to: minimumCapacity };
            if (maximumCapacity !== undefined && maximumCapacity !== beforeItem.maximumCapacity) changes.maximumCapacity = { from: beforeItem.maximumCapacity, to: maximumCapacity };
            if (providerId !== undefined && providerId !== beforeItem.providerId) changes.providerId = { from: beforeItem.providerId, to: providerId };
            if (productionDate !== undefined && productionDate !== beforeItem.productionDate) changes.productionDate = { from: beforeItem.productionDate, to: productionDate };
            if (expiryDate !== undefined && expiryDate !== beforeItem.expiryDate) changes.expiryDate = { from: beforeItem.expiryDate, to: expiryDate };
            if (categoryId !== undefined && categoryId !== beforeItem.categoryId) changes.categoryId = { from: beforeItem.categoryId, to: categoryId };
            if (productCode !== undefined && productCode !== beforeItem.productCode) changes.productCode = { from: beforeItem.productCode, to: productCode };


        }
        await logAudit({
            action: 'UPDATE',
            entityType: 'ITEM',
            entityId: item.id,
            entityName: item.name,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { changes },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= DELETE ADMIN INVENTORY ITEM =============
export const deleteAdminInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if item is in any active orders
        const orderItems = await prisma.orderItem.findMany({
            where: { adminItemId: parseInt(id) },
        });

        if (orderItems.length > 0) {
            return res.status(400).json({
                error: "Cannot delete item that is in existing orders.",
            });
        }

        const item = await prisma.adminInventoryItem.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            message: "Inventory item deleted successfully.",
            item,
        });

        // Audit trail
        await logAudit({
            action: 'DELETE',
            entityType: 'ITEM',
            entityId: parseInt(id),
            entityName: item.name,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { quantity: item.quantity, unit: item.unit },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= ADJUST INVENTORY QUANTITY =============
/**
 * Manually adjust item quantity (add or remove stock)
 */
export const adjustInventoryQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { adjustment, reason } = req.body; // adjustment can be positive or negative

        if (typeof adjustment !== "number") {
            return res.status(400).json({ error: "adjustment must be a number." });
        }

        // Get current item
        const item = await prisma.adminInventoryItem.findUnique({
            where: { id: parseInt(id) },
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found." });
        }

        const newQuantity = item.quantity + adjustment;

        if (newQuantity < 0) {
            return res.status(400).json({
                error: "Insufficient stock. Cannot reduce below 0.",
                currentQuantity: item.quantity,
                attemptedAdjustment: adjustment,
            });
        }

        const updatedItem = await prisma.adminInventoryItem.update({
            where: { id: parseInt(id) },
            data: { quantity: newQuantity },
        });

        res.json({
            message: `Inventory adjusted successfully. ${reason ? `Reason: ${reason}` : ""}`,
            previousQuantity: item.quantity,
            newQuantity: updatedItem.quantity,
            adjustment,
            item: updatedItem,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET INVENTORY SUMMARY =============
/**
 * Get summary of all inventory with low stock alerts
 */
export const getInventorySummary = async (req, res) => {
    try {
        const items = await prisma.adminInventoryItem.findMany();

        const summary = {
            totalItems: items.length,
            totalValue: items.reduce((sum, item) => sum + (item.quantity * (item.pricePerUnit || 0)), 0),
            items: items.map((item) => ({
                ...item,
                estimatedValue: item.quantity * (item.pricePerUnit || 0),
                lowStock: item.quantity < 10, // Alert if less than 10
            })),
        };

        res.json({
            message: "Inventory summary retrieved successfully.",
            summary,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

