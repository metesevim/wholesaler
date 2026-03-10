import prisma from "../prisma/client.js";
import { logAudit } from "../utils/auditLogger.js";

// ============= GET ALL PROVIDERS =============
export const getAllProviders = async (req, res) => {
    try {
        const providers = await prisma.provider.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                items: {
                    select: {
                        id: true,
                        name: true,
                        quantity: true,
                        unit: true,
                    }
                }
            }
        });

        res.json({
            message: "Providers retrieved successfully.",
            providers,
            total: providers.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= GET PROVIDER BY ID =============
export const getProviderById = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await prisma.provider.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    select: {
                        id: true,
                        name: true,
                        quantity: true,
                        unit: true,
                    }
                }
            }
        });

        if (!provider) {
            return res.status(404).json({ error: "Provider not found." });
        }

        res.json({
            message: "Provider retrieved successfully.",
            provider,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= CREATE PROVIDER =============
export const createProvider = async (req, res) => {
    try {
        const { name, email, phone, address, city, country, iban } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required." });
        }

        // Check if provider already exists
        const existing = await prisma.provider.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "Provider with this email already exists." });
        }

        const provider = await prisma.provider.create({
            data: {
                name,
                email,
                phone: phone || null,
                address: address || null,
                city: city || null,
                country: country || null,
                iban: iban || null,
            },
        });

        res.status(201).json({
            message: "Provider created successfully.",
            provider,
        });

        // Audit trail
        await logAudit({
            action: 'CREATE',
            entityType: 'PROVIDER',
            entityId: provider.id,
            entityName: provider.name,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { email, phone, city, country },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE PROVIDER =============
export const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, city, country, iban } = req.body;

        const beforeProvider = await prisma.provider.findUnique({ where: { id: parseInt(id) } });

        const provider = await prisma.provider.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phone !== undefined && { phone }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(country !== undefined && { country }),
                ...(iban !== undefined && { iban }),
            },
        });

        res.json({
            message: "Provider updated successfully.",
            provider,
        });

        // Audit trail
        const changes = {};
        if (beforeProvider) {
            if (name && name !== beforeProvider.name) changes.name = { from: beforeProvider.name, to: name };
            if (email && email !== beforeProvider.email) changes.email = { from: beforeProvider.email, to: email };
        }
        await logAudit({
            action: 'UPDATE',
            entityType: 'PROVIDER',
            entityId: provider.id,
            entityName: provider.name,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { changes },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= DELETE PROVIDER =============
export const deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await prisma.provider.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            message: "Provider deleted successfully.",
            provider,
        });

        // Audit trail
        await logAudit({
            action: 'DELETE',
            entityType: 'PROVIDER',
            entityId: parseInt(id),
            entityName: provider.name,
            userId: req.user?.id,
            username: req.user?.username || 'system',
            details: { email: provider.email },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
