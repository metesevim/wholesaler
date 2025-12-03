import prisma from "../prisma/client.js";

// ============= CREATE ORDER =============
/**
 * Create an order from customer inventory items
 * Automatically reduces quantities from admin inventory
 */
export const createOrder = async (req, res) => {
    try {
        const { customerId, items, notes } = req.body;

        if (!customerId || !items || items.length === 0) {
            return res.status(400).json({
                error: "customerId and items array are required.",
            });
        }

        // Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        // Verify all items exist and are in customer inventory
        const customerInventory = await prisma.customerInventory.findUnique({
            where: { customerId: parseInt(customerId) },
            include: {
                items: true,
            },
        });

        if (!customerInventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        // Validate each item
        const validatedItems = [];
        let totalAmount = 0;

        for (const orderItem of items) {
            const { adminItemId, quantity, unit } = orderItem;

            if (!adminItemId || !quantity || !unit) {
                return res.status(400).json({
                    error: "Each item must have adminItemId, quantity, and unit.",
                });
            }

            // Check if item is in customer inventory
            const customerItem = customerInventory.items.find((ci) => ci.adminItemId === parseInt(adminItemId));
            if (!customerItem) {
                return res.status(400).json({
                    error: `Item ${adminItemId} is not in customer inventory.`,
                });
            }

            // Get admin inventory item
            const adminItem = await prisma.adminInventoryItem.findUnique({
                where: { id: parseInt(adminItemId) },
            });

            if (!adminItem) {
                return res.status(404).json({ error: `Item ${adminItemId} not found in inventory.` });
            }

            // Check if enough stock (compare units)
            if (adminItem.quantity < quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${adminItem.name}. Available: ${adminItem.quantity} ${adminItem.unit}, Requested: ${quantity} ${unit}`,
                });
            }

            const itemTotal = quantity * (adminItem.pricePerUnit || 0);
            totalAmount += itemTotal;

            validatedItems.push({
                adminItem,
                adminItemId: parseInt(adminItemId),
                quantity,
                unit,
                itemTotal,
            });
        }

        // All validations passed, create order in a transaction
        const order = await prisma.order.create({
            data: {
                customerId: parseInt(customerId),
                notes,
                totalAmount,
                status: "PENDING",
                items: {
                    createMany: {
                        data: validatedItems.map((item) => ({
                            adminItemId: item.adminItemId,
                            itemName: item.adminItem.name,
                            unit: item.unit,
                            quantity: item.quantity,
                            pricePerUnit: item.adminItem.pricePerUnit,
                            totalPrice: item.itemTotal,
                        })),
                    },
                },
            },
            include: {
                customer: true,
                items: true,
            },
        });

        // Reduce quantities from admin inventory
        for (const item of validatedItems) {
            await prisma.adminInventoryItem.update({
                where: { id: item.adminItemId },
                data: {
                    quantity: item.adminItem.quantity - item.quantity,
                },
            });
        }

        res.status(201).json({
            message: "Order created successfully. Inventory updated.",
            order,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET ALL ORDERS =============
export const getAllOrders = async (req, res) => {
    try {
        const { status, customerId } = req.query;

        const where = {};
        if (status) where.status = status;
        if (customerId) where.customerId = parseInt(customerId);

        const orders = await prisma.order.findMany({
            where,
            include: {
                customer: true,
                items: {
                    include: {
                        adminItem: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            message: "Orders retrieved successfully.",
            orders,
            total: orders.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET ORDER BY ID =============
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                customer: true,
                items: {
                    include: {
                        adminItem: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        res.json({
            message: "Order retrieved successfully.",
            order,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE ORDER STATUS =============
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status is required." });
        }

        const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                customer: true,
                items: true,
            },
        });

        res.json({
            message: "Order status updated successfully.",
            order,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= CANCEL ORDER =============
/**
 * Cancel an order and restore inventory
 */
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        if (order.status === "DELIVERED" || order.status === "CANCELLED") {
            return res.status(400).json({
                error: `Cannot cancel an order with status ${order.status}.`,
            });
        }

        // Restore inventory quantities
        for (const item of order.items) {
            const adminItem = await prisma.adminInventoryItem.findUnique({
                where: { id: item.adminItemId },
            });

            if (adminItem) {
                await prisma.adminInventoryItem.update({
                    where: { id: item.adminItemId },
                    data: {
                        quantity: adminItem.quantity + item.quantity,
                    },
                });
            }
        }

        // Update order status to CANCELLED
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status: "CANCELLED" },
            include: {
                customer: true,
                items: true,
            },
        });

        res.json({
            message: "Order cancelled successfully. Inventory restored.",
            order: updatedOrder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET CUSTOMER ORDERS =============
export const getCustomerOrders = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { status } = req.query;

        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        const where = { customerId: parseInt(customerId) };
        if (status) where.status = status;

        const orders = await prisma.order.findMany({
            where,
            include: {
                customer: true,
                items: {
                    include: {
                        adminItem: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            message: `Orders for customer ${customer.name} retrieved successfully.`,
            customer,
            orders,
            total: orders.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET ORDER SUMMARY =============
/**
 * Get summary statistics about orders
 */
export const getOrderSummary = async (req, res) => {
    try {
        const allOrders = await prisma.order.findMany({
            include: {
                items: true,
            },
        });

        const summary = {
            totalOrders: allOrders.length,
            byStatus: {
                PENDING: allOrders.filter((o) => o.status === "PENDING").length,
                CONFIRMED: allOrders.filter((o) => o.status === "CONFIRMED").length,
                PROCESSING: allOrders.filter((o) => o.status === "PROCESSING").length,
                SHIPPED: allOrders.filter((o) => o.status === "SHIPPED").length,
                DELIVERED: allOrders.filter((o) => o.status === "DELIVERED").length,
                CANCELLED: allOrders.filter((o) => o.status === "CANCELLED").length,
            },
            totalRevenue: allOrders.reduce((sum, o) => sum + o.totalAmount, 0),
            averageOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, o) => sum + o.totalAmount, 0) / allOrders.length : 0,
        };

        res.json({
            message: "Order summary retrieved successfully.",
            summary,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= ADD ITEM TO ORDER (For updating incomplete orders) =============
/**
 * Add another item to an order before it's confirmed
 */
export const addItemToOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { adminItemId, quantity, unit } = req.body;

        if (!adminItemId || !quantity || !unit) {
            return res.status(400).json({
                error: "adminItemId, quantity, and unit are required.",
            });
        }

        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: {
                items: true,
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        if (order.status !== "PENDING") {
            return res.status(400).json({
                error: `Cannot add items to an order with status ${order.status}.`,
            });
        }

        // Get admin item
        const adminItem = await prisma.adminInventoryItem.findUnique({
            where: { id: parseInt(adminItemId) },
        });

        if (!adminItem) {
            return res.status(404).json({ error: "Item not found in inventory." });
        }

        // Get current inventory (accounting for ordered items)
        const orderedQuantity = order.items
            .filter((oi) => oi.adminItemId === parseInt(adminItemId))
            .reduce((sum, oi) => sum + oi.quantity, 0);

        const availableStock = adminItem.quantity + orderedQuantity;

        if (availableStock < quantity) {
            return res.status(400).json({
                error: `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`,
            });
        }

        // Create order item
        const newOrderItem = await prisma.orderItem.create({
            data: {
                orderId: parseInt(orderId),
                adminItemId: parseInt(adminItemId),
                itemName: adminItem.name,
                unit,
                quantity,
                pricePerUnit: adminItem.pricePerUnit,
                totalPrice: quantity * (adminItem.pricePerUnit || 0),
            },
        });

        // Update order total
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: {
                totalAmount: order.totalAmount + newOrderItem.totalPrice,
            },
            include: {
                items: true,
                customer: true,
            },
        });

        res.json({
            message: "Item added to order successfully.",
            order: updatedOrder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

