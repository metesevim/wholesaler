import prisma from "../prisma/client.js";

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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE PROVIDER =============
export const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, city, country, iban } = req.body;

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
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
