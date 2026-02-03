import prisma from "../prisma/client.js";

//Create an order from customer inventory items
//Automatically reduces quantities from admin inventory

export const createOrder = async (req, res) => {
    try {
        const { customerId, items, notes } = req.body;

        // 1) Validate input
        if (!customerId || !items || items.length === 0) {
            return res.status(400).json({
                error: "customerId and items array are required.",
            });
        }

        // 2) Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
        });

        // 3) If customer not found
        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        // 4) Verify all items exist and are in customer inventory
        const customerInventory = await prisma.customerInventory.findUnique({
            where: { customerId: parseInt(customerId) },
            include: {
                items: true,
            },
        });

        // 5) If customer inventory not found
        if (!customerInventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        // 6) Validate each item
        const validatedItems = [];
        let totalAmount = 0;

        for (const orderItem of items) {
            const { adminItemId, quantity, unit } = orderItem;

            // 1) Check required fields
            if (!adminItemId || !quantity || !unit) {
                return res.status(400).json({
                    error: "Each item must have adminItemId, quantity, and unit.",
                });
            }

            // 2) Get admin inventory item (no need to check customer inventory constraint)
            const adminItem = await prisma.adminInventoryItem.findUnique({
                where: { id: parseInt(adminItemId) },
            });

            if (!adminItem) {
                return res.status(404).json({ error: `Item ${adminItemId} not found in inventory.` });
            }

            // 3) Check if enough stock (compare units)
            // Note: We allow creating orders even if stock is insufficient
            // The frontend warns the user but allows override
            if (adminItem.quantity < quantity) {
                console.warn(
                    `Order created with insufficient stock: ${adminItem.name}. Available: ${adminItem.quantity}, Requested: ${quantity}`
                );
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

//Get all orders with optional filters
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

        const validStatuses = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];
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

        // Update order status into CANCELLED
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

//Add item to existing order before confirmation

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

        // Verify item is in customer inventory
        const customerInventory = await prisma.customerInventory.findUnique({
            where: { customerId: order.customerId },
            include: {
                items: true,
            },
        });

        if (!customerInventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        const customerItem = customerInventory.items.find((ci) => ci.adminItemId === parseInt(adminItemId));
        if (!customerItem) {
            return res.status(400).json({
                error: `Item ${adminItemId} is not in customer inventory.`,
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

//Get all items available in a customer's inventory for creating orders
//Shows only items the customer has access to, with admin inventory details

export const getCustomerAvailableItems = async (req, res) => {
    try {
        const { customerId } = req.params;

        // 1) Verify customer exists
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        // 2) Get customer's inventory with all assigned items and their details
        const customerInventory = await prisma.customerInventory.findUnique({
            where: { customerId: parseInt(customerId) },
            include: {
                items: {
                    include: {
                        adminItem: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                quantity: true,
                                unit: true,
                                imageUrl: true,
                                pricePerUnit: true,
                            },
                        },
                    },
                },
            },
        });

        if (!customerInventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        // 3) Format response with available items
        const availableItems = customerInventory.items.map((item) => ({
            id: item.adminItem.id,
            name: item.adminItem.name,
            description: item.adminItem.description,
            currentStock: item.adminItem.quantity,
            unit: item.adminItem.unit,
            imageUrl: item.adminItem.imageUrl,
            pricePerUnit: item.adminItem.pricePerUnit,
            inStock: item.adminItem.quantity > 0,
        }));

        res.json({
            message: `Available items for customer ${customer.name}`,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
            },
            itemCount: availableItems.length,
            items: availableItems,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= DELETE ORDER =============
/**
 * Delete an order and restore inventory if it's not yet confirmed
 */
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        // Can only delete orders that are PENDING, CANCELLED, or DELIVERED
        // SHIPPED orders cannot be deleted
        if (order.status === "SHIPPED") {
            return res.status(400).json({
                error: `Cannot delete an order with status ${order.status}. Only PENDING, CANCELLED, or DELIVERED orders can be deleted.`,
            });
        }

        // If order is PENDING, restore inventory
        if (order.status === "PENDING") {
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
        }

        // Delete order items first
        await prisma.orderItem.deleteMany({
            where: { orderId: parseInt(id) },
        });

        // Delete order
        const deletedOrder = await prisma.order.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            message: "Order deleted successfully." +
                (order.status === "PENDING"
                    ? " Inventory restored."
                    : ""),
            order: deletedOrder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

