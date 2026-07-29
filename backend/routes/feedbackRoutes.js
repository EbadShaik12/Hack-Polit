import express from 'express';
import {
  submitFeedback,
  getMyFeedback,
  getHackathonFeedback,
  getOrganizerFeedbackOverview,
} from '../controllers/feedbackController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/hackathon/:hackathonId', getHackathonFeedback);

// Protected routes
router.get('/my-feedback/:hackathonId', protect, getMyFeedback);
router.post('/', protect, submitFeedback);
router.get(
  '/organizer/all',
  protect,
  authorizeRoles('organizer', 'admin'),
  getOrganizerFeedbackOverview
);

export default router;
