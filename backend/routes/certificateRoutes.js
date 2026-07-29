import express from 'express';
import {
  issueCertificate,
  getUserCertificates,
  getAllCertificates,
  getCertificateById,
} from '../controllers/certificateController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('organizer', 'admin'), issueCertificate);
router.get('/', authorizeRoles('organizer', 'admin'), getAllCertificates);
router.get('/my-certificates', getUserCertificates);
router.get('/:id', getCertificateById);

export default router;
