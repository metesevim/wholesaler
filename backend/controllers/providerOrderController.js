import prisma from "../prisma/client.js";
import nodemailer from "nodemailer";

// ============= GET ALL PROVIDER ORDERS =============
export const getAllProviderOrders = async (req, res) => {
    try {
        const { status, providerId } = req.query;

        const where = {};
        if (status) where.status = status;
        if (providerId) where.providerId = parseInt(providerId);

        const orders = await prisma.providerOrder.findMany({
            where,
            include: {
                provider: true,
                items: {
                    include: {
                        adminItem: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            message: "Provider orders retrieved successfully.",
            orders,
            total: orders.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET PROVIDER ORDER BY ID =============
export const getProviderOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.providerOrder.findUnique({
            where: { id: parseInt(id) },
            include: {
                provider: true,
                items: {
                    include: {
                        adminItem: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Provider order not found." });
        }

        res.json({
            message: "Provider order retrieved successfully.",
            order,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= CHECK AND CREATE PROVIDER ORDERS FOR LOW STOCK =============
export const checkAndCreateProviderOrders = async (req, res) => {
    try {
        // Get all inventory items with their stock levels
        const items = await prisma.adminInventoryItem.findMany({
            where: {
                providerId: { not: null }, // Only items with providers
            },
            include: {
                provider: true,
                category: true,
            },
        });

        const lowStockItems = [];
        const ordersCreated = [];
        const itemsAddedToExisting = [];

        for (const item of items) {
            // Skip items without valid maximumCapacity
            if (!item.maximumCapacity || item.maximumCapacity <= 0) {
                console.log(`Skipping item ${item.name}: no valid maximumCapacity`);
                continue;
            }

            // Calculate stock percentage (quantity / maxCapacity * 100)
            const stockPercentage = (item.quantity / item.maximumCapacity) * 100;

            console.log(`Item: ${item.name}, Qty: ${item.quantity}, MaxCap: ${item.maximumCapacity}, Stock%: ${stockPercentage.toFixed(1)}%`);

            // If stock is 50% or below of maximum capacity
            if (stockPercentage <= 50 && item.providerId) {
                lowStockItems.push(item);

                // Calculate quantity to order (fill to max capacity)
                const quantityToOrder = item.maximumCapacity - item.quantity;

                // Check if there's already a pending order for this provider
                let existingOrder = await prisma.providerOrder.findFirst({
                    where: {
                        providerId: item.providerId,
                        status: "PENDING",
                    },
                    include: {
                        items: true,
                    },
                });

                // Check if this item is already in the pending order
                if (existingOrder) {
                    const existingItem = existingOrder.items.find(
                        (orderItem) => orderItem.adminItemId === item.id
                    );

                    if (!existingItem) {
                        // Add item to existing order
                        const itemTotal = quantityToOrder * (item.pricePerUnit || 0);

                        await prisma.providerOrderItem.create({
                            data: {
                                providerOrderId: existingOrder.id,
                                adminItemId: item.id,
                                itemName: item.name,
                                productCode: item.productCode,
                                unit: item.unit,
                                quantity: quantityToOrder,
                                pricePerUnit: item.pricePerUnit,
                                totalPrice: itemTotal,
                            },
                        });

                        // Update order total
                        await prisma.providerOrder.update({
                            where: { id: existingOrder.id },
                            data: {
                                totalAmount: existingOrder.totalAmount + itemTotal,
                            },
                        });

                        itemsAddedToExisting.push({
                            item: item.name,
                            orderId: existingOrder.id,
                            quantity: quantityToOrder,
                        });
                    }
                } else {
                    // Create new provider order
                    const itemTotal = quantityToOrder * (item.pricePerUnit || 0);

                    const newOrder = await prisma.providerOrder.create({
                        data: {
                            providerId: item.providerId,
                            status: "PENDING",
                            totalAmount: itemTotal,
                            items: {
                                create: {
                                    adminItemId: item.id,
                                    itemName: item.name,
                                    productCode: item.productCode,
                                    unit: item.unit,
                                    quantity: quantityToOrder,
                                    pricePerUnit: item.pricePerUnit,
                                    totalPrice: itemTotal,
                                },
                            },
                        },
                        include: {
                            provider: true,
                            items: true,
                        },
                    });

                    ordersCreated.push({
                        orderId: newOrder.id,
                        provider: newOrder.provider.name,
                        item: item.name,
                        quantity: quantityToOrder,
                    });
                }
            }
        }

        res.json({
            message: "Low stock check completed.",
            lowStockItemsCount: lowStockItems.length,
            ordersCreated,
            itemsAddedToExisting,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= ADD ITEM TO PROVIDER ORDER =============
export const addItemToProviderOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminItemId, quantity } = req.body;

        if (!adminItemId || !quantity) {
            return res.status(400).json({ error: "adminItemId and quantity are required." });
        }

        const order = await prisma.providerOrder.findUnique({
            where: { id: parseInt(id) },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ error: "Provider order not found." });
        }

        if (order.status !== "PENDING") {
            return res.status(400).json({ error: "Can only add items to pending orders." });
        }

        const item = await prisma.adminInventoryItem.findUnique({
            where: { id: parseInt(adminItemId) },
        });

        if (!item) {
            return res.status(404).json({ error: "Inventory item not found." });
        }

        // Check if item already exists in order
        const existingItem = order.items.find((i) => i.adminItemId === parseInt(adminItemId));
        if (existingItem) {
            return res.status(400).json({ error: "Item already exists in this order." });
        }

        const itemTotal = quantity * (item.pricePerUnit || 0);

        await prisma.providerOrderItem.create({
            data: {
                providerOrderId: order.id,
                adminItemId: item.id,
                itemName: item.name,
                productCode: item.productCode,
                unit: item.unit,
                quantity,
                pricePerUnit: item.pricePerUnit,
                totalPrice: itemTotal,
            },
        });

        // Update order total
        const updatedOrder = await prisma.providerOrder.update({
            where: { id: order.id },
            data: {
                totalAmount: order.totalAmount + itemTotal,
            },
            include: {
                provider: true,
                items: {
                    include: {
                        adminItem: true,
                    },
                },
            },
        });

        res.json({
            message: "Item added to provider order successfully.",
            order: updatedOrder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= REMOVE ITEM FROM PROVIDER ORDER =============
export const removeItemFromProviderOrder = async (req, res) => {
    try {
        const { id, itemId } = req.params;

        const order = await prisma.providerOrder.findUnique({
            where: { id: parseInt(id) },
            include: { items: true },
        });

        if (!order) {
            return res.status(404).json({ error: "Provider order not found." });
        }

        if (order.status !== "PENDING") {
            return res.status(400).json({ error: "Can only remove items from pending orders." });
        }

        const orderItem = order.items.find((i) => i.id === parseInt(itemId));
        if (!orderItem) {
            return res.status(404).json({ error: "Item not found in this order." });
        }

        await prisma.providerOrderItem.delete({
            where: { id: parseInt(itemId) },
        });

        // Update order total
        const updatedOrder = await prisma.providerOrder.update({
            where: { id: order.id },
            data: {
                totalAmount: order.totalAmount - (orderItem.totalPrice || 0),
            },
            include: {
                provider: true,
                items: {
                    include: {
                        adminItem: true,
                    },
                },
            },
        });

        res.json({
            message: "Item removed from provider order successfully.",
            order: updatedOrder,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE PROVIDER ORDER STATUS =============
export const updateProviderOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status is required." });
        }

        const validStatuses = ["PENDING", "SENT", "CONFIRMED", "SHIPPED", "RECEIVED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const order = await prisma.providerOrder.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                provider: true,
                items: {
                    include: {
                        adminItem: true,
                    },
                },
            },
        });

        // If status is RECEIVED, update inventory quantities
        if (status === "RECEIVED") {
            for (const item of order.items) {
                await prisma.adminInventoryItem.update({
                    where: { id: item.adminItemId },
                    data: {
                        quantity: {
                            increment: item.quantity,
                        },
                    },
                });
            }
        }

        res.json({
            message: "Provider order status updated successfully.",
            order,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= SEND PROVIDER ORDER EMAIL =============
export const sendProviderOrderEmail = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.providerOrder.findUnique({
            where: { id: parseInt(id) },
            include: {
                provider: true,
                items: {
                    include: {
                        adminItem: {
                            include: {
                                category: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Provider order not found." });
        }

        if (!order.provider.email) {
            return res.status(400).json({ error: "Provider does not have an email address." });
        }

        // Generate order PDF HTML
        const pdfHtml = generateProviderOrderHTML(order);

        // Configure email transporter (you'll need to set these env variables)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email with HTML content
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "orders@wholesalehub.com",
            to: order.provider.email,
            subject: `Purchase Order #${order.id} - Wholesale Hub`,
            html: pdfHtml,
        });

        // Update order status and email sent flag
        const updatedOrder = await prisma.providerOrder.update({
            where: { id: order.id },
            data: {
                status: "SENT",
                emailSent: true,
                emailSentAt: new Date(),
            },
            include: {
                provider: true,
                items: true,
            },
        });

        res.json({
            message: "Email sent successfully to provider.",
            order: updatedOrder,
        });
    } catch (err) {
        console.error("Email send error:", err);
        res.status(500).json({ error: `Failed to send email: ${err.message}` });
    }
};

// ============= DELETE PROVIDER ORDER =============
export const deleteProviderOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.providerOrder.findUnique({
            where: { id: parseInt(id) },
        });

        if (!order) {
            return res.status(404).json({ error: "Provider order not found." });
        }

        if (order.status !== "PENDING" && order.status !== "CANCELLED") {
            return res.status(400).json({
                error: "Can only delete pending or cancelled orders."
            });
        }

        await prisma.providerOrder.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            message: "Provider order deleted successfully.",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GENERATE PROVIDER ORDER HTML (for PDF/Email) =============
function generateProviderOrderHTML(order) {
    const formatDate = (date) => {
        if (!date) return '-';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const escapeHtml = (value) => {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    let rowsHtml = '';
    order.items.forEach((item, index) => {
        const categoryName = item.adminItem?.category?.name || 'Uncategorized';
        rowsHtml += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-family: monospace;">${escapeHtml(item.productCode || '-')}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: 600;">${escapeHtml(item.itemName)}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${escapeHtml(categoryName)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: 700;">${escapeHtml(String(item.quantity))}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${escapeHtml(item.unit)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₺${(item.pricePerUnit || 0).toFixed(2)}</td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-weight: 700;">₺${(item.totalPrice || 0).toFixed(2)}</td>
            </tr>
        `;
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Purchase Order #${order.id}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', Arial, sans-serif;
            color: #333;
            line-height: 1.5;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            border-bottom: 3px solid #137fec;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #137fec;
        }
        .order-title {
            font-size: 28px;
            font-weight: 800;
            margin: 20px 0 10px 0;
        }
        .order-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 20px;
            background: #f7f7f7;
            border-radius: 8px;
        }
        .meta-item {
            text-align: center;
        }
        .meta-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .meta-value {
            font-size: 16px;
            font-weight: 700;
            margin-top: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #137fec;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .total-row {
            background: #f0f7ff;
            font-weight: 800;
            font-size: 16px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        .notes {
            background: #fffde7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🚚 Wholesale Hub</div>
        <div class="order-title">Purchase Order #${order.id}</div>
    </div>

    <div class="order-meta">
        <div class="meta-item">
            <div class="meta-label">Provider</div>
            <div class="meta-value">${escapeHtml(order.provider?.name || 'Unknown')}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Order Date</div>
            <div class="meta-value">${formatDate(order.createdAt)}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Total Items</div>
            <div class="meta-value">${order.items.length}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Status</div>
            <div class="meta-value">${order.status}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 12%;">Code</th>
                <th style="width: 25%;">Item</th>
                <th style="width: 15%;">Category</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 8%;">Unit</th>
                <th style="width: 12%;">Price</th>
                <th style="width: 13%;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHtml}
            <tr class="total-row">
                <td colspan="7" style="padding: 12px; border: 1px solid #ddd; text-align: right;">TOTAL AMOUNT:</td>
                <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">₺${(order.totalAmount || 0).toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    ${order.notes ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(order.notes)}</div>` : ''}

    <div class="footer">
        <p>This is an automated purchase order from Wholesale Hub.</p>
        <p>Please confirm receipt of this order by replying to this email.</p>
        <p>Generated on ${formatDate(new Date())}</p>
    </div>
</body>
</html>
    `;
}

// Export the HTML generator for frontend use
export { generateProviderOrderHTML };

