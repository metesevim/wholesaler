import prisma from "../prisma/client.js";

// ============= GET ALL UNITS =============
export const getAllUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({ orderBy: { name: 'asc' } });
    res.json({ message: 'Units retrieved successfully.', units });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============= CREATE UNIT =============
export const createUnit = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Unit name is required.' });

    const existing = await prisma.unit.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ error: 'Unit already exists.' });

    const unit = await prisma.unit.create({ data: { name } });
    res.status(201).json({ message: 'Unit created.', unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============= UPDATE UNIT =============
export const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Unit name is required.' });

    const unit = await prisma.unit.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json({ message: 'Unit updated.', unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============= DELETE UNIT =============
export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.unit.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Unit deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

