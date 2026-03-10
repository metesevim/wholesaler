import prisma from "../prisma/client.js";
import { logAudit } from "../utils/auditLogger.js";

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

    // Audit trail (req.user may not exist if no auth middleware on this route)
    await logAudit({
      action: 'CREATE',
      entityType: 'UNIT',
      entityId: unit.id,
      entityName: unit.name,
      userId: req.user?.id || null,
      username: req.user?.username || 'system',
      details: {},
    });
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

    // Audit trail
    await logAudit({
      action: 'UPDATE',
      entityType: 'UNIT',
      entityId: unit.id,
      entityName: unit.name,
      userId: req.user?.id || null,
      username: req.user?.username || 'system',
      details: { newName: name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ============= DELETE UNIT =============
export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await prisma.unit.findUnique({ where: { id: parseInt(id) } });
    await prisma.unit.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Unit deleted.' });

    // Audit trail
    await logAudit({
      action: 'DELETE',
      entityType: 'UNIT',
      entityId: parseInt(id),
      entityName: unit?.name || `Unit #${id}`,
      userId: req.user?.id || null,
      username: req.user?.username || 'system',
      details: {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

