import prisma from "../prisma/client.js";

// ============= GET ALL CATEGORIES =============
export const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });

        res.json({
            message: "Categories retrieved successfully.",
            categories,
            total: categories.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= CREATE CATEGORY =============
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Category name is required." });
        }

        // Check if category already exists
        const existing = await prisma.category.findUnique({
            where: { name },
        });

        if (existing) {
            return res.status(400).json({ error: "Category with this name already exists." });
        }

        const category = await prisma.category.create({
            data: {
                name,
                description: description || null,
            },
        });

        res.status(201).json({
            message: "Category created successfully.",
            category,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= UPDATE CATEGORY =============
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Category name is required." });
        }

        // Check if another category with this name exists
        const existing = await prisma.category.findUnique({
            where: { name },
        });

        if (existing && existing.id !== parseInt(id)) {
            return res.status(400).json({ error: "Category with this name already exists." });
        }

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description: description !== undefined ? description : undefined,
            },
        });

        res.json({
            message: "Category updated successfully.",
            category,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ============= DELETE CATEGORY =============
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any items are using this category
        const itemsWithCategory = await prisma.adminInventoryItem.findMany({
            where: { categoryId: parseInt(id) },
        });

        if (itemsWithCategory.length > 0) {
            return res.status(400).json({
                error: `Cannot delete category. ${itemsWithCategory.length} item(s) are using this category.`,
            });
        }

        const category = await prisma.category.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            message: "Category deleted successfully.",
            category,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
