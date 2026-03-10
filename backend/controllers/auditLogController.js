/**
 * Audit Log Controller
 *
 * Provides a read-only API to query the audit trail.
 * Supports pagination, filtering by action/entityType/userId/date range, and text search.
 */

import prisma from '../prisma/client.js';

/**
 * GET /audit-logs
 *
 * Query params:
 *   page        - Page number (default 1)
 *   limit       - Items per page (default 50)
 *   action      - Filter by action (CREATE, UPDATE, DELETE, STATUS_CHANGE)
 *   entityType  - Filter by entity type (ORDER, ITEM, CUSTOMER, etc.)
 *   userId      - Filter by user ID
 *   search      - Search in entityName or username
 *   startDate   - ISO date string for range start
 *   endDate     - ISO date string for range end
 */
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      userId,
      search,
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};

    if (action) {
      where.action = action;
    }
    if (entityType) {
      where.entityType = entityType;
    }
    if (userId) {
      where.userId = parseInt(userId);
    }
    if (search) {
      where.OR = [
        { entityName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Query with pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      message: 'Audit logs retrieved successfully.',
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /audit-logs/stats
 *
 * Returns summary statistics for the audit trail.
 */
export const getAuditStats = async (req, res) => {
  try {
    const [total, byAction, byEntity, recentUsers] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { id: true },
      }),
      prisma.auditLog.groupBy({
        by: ['entityType'],
        _count: { id: true },
      }),
      prisma.auditLog.findMany({
        select: { username: true },
        distinct: ['username'],
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    res.json({
      total,
      byAction: byAction.reduce((acc, item) => {
        acc[item.action] = item._count.id;
        return acc;
      }, {}),
      byEntity: byEntity.reduce((acc, item) => {
        acc[item.entityType] = item._count.id;
        return acc;
      }, {}),
      activeUsers: recentUsers.map((u) => u.username),
    });
  } catch (err) {
    console.error('Failed to fetch audit stats:', err);
    res.status(500).json({ error: err.message });
  }
};

