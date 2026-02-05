import prisma from "../prisma/client.js";

// ============= CREATE ADMIN INVENTORY ITEM =============
/**
 * Admin/Employee creates an item in admin inventory
 * Includes name, description, quantity, unit, image, price, and low stock alert threshold
 */
export const createAdminInventoryItem = async (req, res) => {
    try {
        const { name, description, quantity, unit, imageUrl, pricePerUnit, lowStockAlert, providerId, productionDate, expiryDate } = req.body;

        console.log('Create item request received:', { name, description, quantity, unit, imageUrl, pricePerUnit, lowStockAlert, providerId, productionDate, expiryDate });

        if (!name) {
            return res.status(400).json({ error: "Item name is required." });
        }

        // Get or create admin inventory for the admin user
        // For now, we'll assume there's a main admin user (id: 1)
        // In production, this should be configurable
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
                quantity: quantity || 0,
                unit: unit || "piece",
                imageUrl,
                pricePerUnit,
                lowStockAlert: lowStockAlert || 20,
                providerId: providerId ? parseInt(providerId) : null,
                productionDate: productionDate ? new Date(productionDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
            },
            include: {
                provider: true,
            },
        });

        res.status(201).json({
            message: "Inventory item created successfully.",
            item,
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

// ============= UPDATE ADMIN INVENTORY ITEM =============
export const updateAdminInventoryItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, quantity, unit, imageUrl, pricePerUnit, lowStockAlert, providerId, productionDate, expiryDate } = req.body;

        console.log('Update item request received:', { id, name, description, quantity, unit, imageUrl, pricePerUnit, lowStockAlert, providerId, productionDate, expiryDate });

        const item = await prisma.adminInventoryItem.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                ...(quantity !== undefined && { quantity }),
                ...(unit && { unit }),
                ...(imageUrl && { imageUrl }),
                ...(pricePerUnit !== undefined && { pricePerUnit }),
                ...(lowStockAlert !== undefined && { lowStockAlert }),
                ...(providerId !== undefined && { providerId: providerId ? parseInt(providerId) : null }),
                ...(productionDate !== undefined && { productionDate: productionDate ? new Date(productionDate) : null }),
                ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
            },
            include: {
                provider: true,
            },
        });

        res.json({
            message: "Inventory item updated successfully.",
            item,
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

