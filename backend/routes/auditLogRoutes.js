/**
 * Audit Log Routes
 *
 * GET /audit-logs        - List audit logs (paginated, filterable)
 * GET /audit-logs/stats  - Audit trail statistics
 */

import express from 'express';
import { authJWT, requireRole } from '../middleware/authMiddleware.js';
import { getAuditLogs, getAuditStats } from '../controllers/auditLogController.js';

const router = express.Router();

// All audit log routes require Admin role
router.get('/stats', authJWT, requireRole('Admin'), getAuditStats);
router.get('/', authJWT, requireRole('Admin'), getAuditLogs);

export default router;

