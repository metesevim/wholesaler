/**
 * Audit Logger Utility
 *
 * Reusable function to log audit trail events.
 * Writes to the AuditLog table via Prisma.
 * Designed to never throw — errors are silently logged to console
 * so they never block the main business response.
 */

import prisma from '../prisma/client.js';

/**
 * Log an audit trail event
 *
 * @param {Object} params
 * @param {string} params.action       - CREATE | UPDATE | DELETE | STATUS_CHANGE
 * @param {string} params.entityType   - ORDER | ITEM | CUSTOMER | PROVIDER | EMPLOYEE | CATEGORY | PROVIDER_ORDER | UNIT
 * @param {number} params.entityId     - ID of the affected entity
 * @param {string} params.entityName   - Human-readable name (e.g. "Cheese", "Order #15")
 * @param {number|null} params.userId  - ID of the user who performed the action
 * @param {string} params.username     - Username of the user who performed the action
 * @param {Object|null} params.details - Optional JSON with before/after snapshots or summary
 */
export const logAudit = async ({ action, entityType, entityId, entityName, userId, username, details = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        entityName,
        userId: userId || null,
        username: username || 'system',
        details: details || undefined,
      },
    });
  } catch (err) {
    // Never block the business logic — just log the error
    console.error('[AuditLogger] Failed to write audit log:', err.message);
  }
};

export default logAudit;

