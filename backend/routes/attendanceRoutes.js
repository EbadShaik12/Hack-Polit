import express from 'express';
import {
  scanQRCode,
  getAttendanceHistory,
  getParticipantAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/scan', authorizeRoles('organizer', 'admin'), scanQRCode);
router.get('/history', authorizeRoles('organizer', 'admin'), getAttendanceHistory);
router.get('/my-status/:hackathonId', getParticipantAttendance);

export default router;
