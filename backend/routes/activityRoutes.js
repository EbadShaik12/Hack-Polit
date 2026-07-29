import express from 'express';
import { getActivities, getAuditLogs } from '../controllers/activityController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getActivities);
router.get('/audit-logs', authorizeRoles('admin', 'organizer'), getAuditLogs);

export default router;
