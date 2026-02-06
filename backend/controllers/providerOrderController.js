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
    order.items.forEach((item) => {
        const categoryName = item.adminItem?.category?.name || 'Uncategorized';
        rowsHtml += `
            <tr>
                <td class="col-code">${escapeHtml(item.productCode || '-')}</td>
                <td class="col-name">${escapeHtml(item.itemName)}</td>
                <td class="col-cat">${escapeHtml(categoryName)}</td>
                <td class="col-qty">${escapeHtml(String(item.quantity))}</td>
                <td class="col-unit">${escapeHtml(item.unit)}</td>
            </tr>
        `;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Purchase Order #${order.id} - ${escapeHtml(order.provider?.name || 'Unknown')}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
        /* ---------- Base ---------- */
        * { box-sizing: border-box; }
        html, body {
            margin: 0;
            padding: 0;
            color: #111;
            background: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
                         "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 11px;
            line-height: 1.35;
        }

        .sheet {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
        }

        /* ---------- Header ---------- */
        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-bottom: 10px;
            border-bottom: 2px solid #111;
            margin-bottom: 15px;
        }

        .title {
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 0.6px;
            text-transform: uppercase;
        }

        .orderNo {
            text-align: right;
        }
        .orderNo .label { font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 0.3px; }
        .orderNo .value { font-size: 14px; font-weight: 800; }

        /* ---------- Meta grid ---------- */
        .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            padding: 12px;
            border: 1px solid #e6e6e6;
            background: #f7f7f7;
            border-radius: 6px;
            margin-bottom: 15px;
        }

        .metaItem {
            flex: 1;
            min-width: 120px;
        }
        .metaItem .k {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            font-weight: 700;
        }
        .metaItem .v {
            font-size: 11px;
            color: #111;
            font-weight: 700;
            margin-top: 2px;
        }

        /* ---------- Table ---------- */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th, td {
            border: 1px solid #d9d9d9;
            padding: 8px 6px;
            vertical-align: middle;
        }

        th {
            background: #111;
            color: #fff;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.35px;
        }

        tbody tr:nth-child(odd) td {
            background: #fcfcfc;
        }

        .col-code { width: 15%; font-family: monospace; font-size: 10px; }
        .col-name { width: 40%; font-weight: 600; }
        .col-cat  { width: 20%; }
        .col-qty  { width: 12%; text-align: center; font-weight: 800; }
        .col-unit { width: 13%; text-align: center; }

        /* ---------- Notes ---------- */
        .notes {
            margin-top: 15px;
            padding: 10px 12px;
            background: #fffde7;
            border-left: 4px solid #ffc107;
            border-radius: 0 6px 6px 0;
        }
        .notes-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 4px;
        }

        /* ---------- Footer ---------- */
        .footer {
            margin-top: 25px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
        }

        .sign-box {
            flex: 1;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            padding: 12px;
        }

        .sign-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 8px;
        }

        .sign-line {
            height: 35px;
            border-bottom: 1.5px solid #111;
            margin-bottom: 6px;
        }

        .sign-date {
            font-size: 9px;
            color: #666;
        }

        .printInfo {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #e6e6e6;
            font-size: 9px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="sheet">
        <div class="topbar">
            <div class="title">🚚 Wholesale Hub - Purchase Order</div>
            <div class="orderNo">
                <div class="label">Order ID</div>
                <div class="value">#${escapeHtml(String(order.id))}</div>
            </div>
        </div>

        <div class="meta">
            <div class="metaItem">
                <div class="k">Provider</div>
                <div class="v">${escapeHtml(order.provider?.name || 'Unknown')}</div>
            </div>
            <div class="metaItem">
                <div class="k">Email</div>
                <div class="v">${escapeHtml(order.provider?.email || '-')}</div>
            </div>
            <div class="metaItem">
                <div class="k">Order Date</div>
                <div class="v">${formatDate(order.createdAt)}</div>
            </div>
            <div class="metaItem">
                <div class="k">Total Items</div>
                <div class="v">${order.items.length}</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="col-code">Code</th>
                    <th class="col-name">Item Name</th>
                    <th class="col-cat">Category</th>
                    <th class="col-qty">Qty</th>
                    <th class="col-unit">Unit</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        ${order.notes ? `
        <div class="notes">
            <div class="notes-title">Notes</div>
            <div>${escapeHtml(order.notes)}</div>
        </div>
        ` : ''}


        <div class="printInfo">
            This is an official purchase order from Wholesale Hub.<br>
            Please confirm receipt and expected delivery date by replying to this email.<br>
            Generated on ${formatDate(new Date())}
        </div>
    </div>
</body>
</html>`;
}

// Export the HTML generator for frontend use
export { generateProviderOrderHTML };

