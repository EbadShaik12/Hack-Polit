import express from 'express';
import {
  submitProject,
  getTeamSubmission,
  getHackathonSubmissions,
  getPublicGallery,
  approveSubmission,
} from '../controllers/submissionController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route — no auth needed
router.get('/gallery', getPublicGallery);

// Private participant routes
router.post('/', protect, submitProject);
router.get('/my-team', protect, getTeamSubmission);

// Private organizer/judge read route
router.get(
  '/hackathon/:hackathonId',
  protect,
  authorizeRoles('organizer', 'admin', 'judge'),
  getHackathonSubmissions
);

// Private organizer toggle-approve route
router.patch(
  '/:id/approve',
  protect,
  authorizeRoles('organizer', 'admin'),
  approveSubmission
);

export default router;
