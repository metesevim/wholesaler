import prisma from "../../prisma/client.js";

// ============= CREATE CUSTOMER =============
/**
 * Create a new customer with inventory
 * Admin only
 */
export const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, city, country, iban, itemIds } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required." });
        }

        // Check if customer already exists
        const existing = await prisma.customer.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "Customer with this email already exists." });
        }

        // Validate item IDs if provided
        if (itemIds && Array.isArray(itemIds)) {
            const items = await prisma.adminInventoryItem.findMany({
                where: { id: { in: itemIds } },
            });
            if (items.length !== itemIds.length) {
                return res.status(400).json({ error: "Some items do not exist." });
            }
        }

        // Create customer with inventory
        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                address,
                city,
                country,
                iban,
                inventory: {
                    create: {
                        // Assign items to customer inventory (from admin inventory)
                        items: itemIds
                            ? {
                                  createMany: {
                                      data: itemIds.map((adminItemId) => ({
                                          adminItemId,
                                      })),
                                  },
                              }
                            : undefined,
                    },
                },
            },
            include: {
                inventory: {
                    include: {
                        items: {
                            include: {
                                adminItem: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({
            message: "Customer created successfully.",
            customer,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET ALL CUSTOMERS =============
export const getAllCustomers = async (req, res) => {
    try {
        if (!prisma || !prisma.customer) {
            console.error("Prisma client not initialized properly");
            return res.status(500).json({ error: "Database connection error" });
        }

        const customers = await prisma.customer.findMany({
            include: {
                inventory: {
                    include: {
                        items: {
                            include: {
                                adminItem: true,
                            },
                        },
                    },
                },
            },
        });

        res.json({
            message: "Customers retrieved successfully.",
            customers: customers || [],
        });
    } catch (err) {
        console.error("Error fetching customers:", err);
        res.status(500).json({ error: err.message || "Failed to fetch customers" });
    }
};

// ============= GET SINGLE CUSTOMER =============
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(id) },
            include: {
                inventory: {
                    include: {
                        items: {
                            include: {
                                adminItem: true,
                            },
                        },
                    },
                },
            },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        res.json({
            message: "Customer retrieved successfully.",
            customer,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE CUSTOMER =============
export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, city, country, iban } = req.body;

        const customer = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone && { phone }),
                ...(address && { address }),
                ...(city && { city }),
                ...(country && { country }),
                ...(iban && { iban }),
            },
            include: {
                inventory: {
                    include: {
                        items: {
                            include: {
                                adminItem: true,
                            },
                        },
                    },
                },
            },
        });

        res.json({
            message: "Customer updated successfully.",
            customer,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= ADD ITEMS TO CUSTOMER INVENTORY =============
/**
 * Add items from admin inventory to customer inventory
 */
export const addItemsToCustomerInventory = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { itemIds } = req.body;

        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ error: "itemIds must be a non-empty array." });
        }

        // Verify customer exists and has inventory
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
            include: { inventory: true },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        if (!customer.inventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        // Verify items exist
        const items = await prisma.adminInventoryItem.findMany({
            where: { id: { in: itemIds } },
        });

        if (items.length !== itemIds.length) {
            return res.status(400).json({ error: "Some items do not exist." });
        }

        // Check if items already in customer inventory
        const existingItems = await prisma.customerInventoryItem.findMany({
            where: {
                customerInventoryId: customer.inventory.id,
                adminItemId: { in: itemIds },
            },
        });

        if (existingItems.length > 0) {
            return res.status(400).json({ error: "Some items are already in customer inventory." });
        }

        // Add items to customer inventory
        const addedItems = await prisma.customerInventoryItem.createMany({
            data: itemIds.map((adminItemId) => ({
                customerInventoryId: customer.inventory.id,
                adminItemId,
            })),
        });

        res.json({
            message: `${addedItems.count} items added to customer inventory.`,
            count: addedItems.count,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= REMOVE ITEMS FROM CUSTOMER INVENTORY =============
/**
 * Remove items from customer inventory
 */
export const removeItemsFromCustomerInventory = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { itemIds } = req.body;

        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ error: "itemIds must be a non-empty array." });
        }

        // Verify customer exists and has inventory
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
            include: { inventory: true },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        if (!customer.inventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        // Remove items
        const deletedItems = await prisma.customerInventoryItem.deleteMany({
            where: {
                customerInventoryId: customer.inventory.id,
                adminItemId: { in: itemIds },
            },
        });

        res.json({
            message: `${deletedItems.count} items removed from customer inventory.`,
            count: deletedItems.count,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET CUSTOMER INVENTORY =============
/**
 * Get customer's inventory with available items
 */
export const getCustomerInventory = async (req, res) => {
    try {
        const { customerId } = req.params;

        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(customerId) },
            include: {
                inventory: {
                    include: {
                        items: {
                            include: {
                                adminItem: true,
                            },
                        },
                    },
                },
            },
        });

        if (!customer) {
            return res.status(404).json({ error: "Customer not found." });
        }

        if (!customer.inventory) {
            return res.status(400).json({ error: "Customer inventory not found." });
        }

        res.json({
            message: "Customer inventory retrieved successfully.",
            inventory: customer.inventory,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

