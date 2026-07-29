import express from 'express';
import {
  createHackathon,
  getHackathons,
  getOrganizerHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  toggleBookmark,
  getBookmarks,
  getOrganizerInsights,
} from '../controllers/hackathonController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getHackathons);

// Bookmark & Organizer Insights routes — must appear before /:id to avoid route collision
router.get('/bookmarks', protect, getBookmarks);
router.post('/:id/bookmark', protect, toggleBookmark);
router.get(
  '/organizer/insights',
  protect,
  authorizeRoles('organizer', 'admin'),
  getOrganizerInsights
);

router.get('/:id', getHackathonById);

// Organizer & Admin protected routes
router.post(
  '/',
  protect,
  authorizeRoles('organizer', 'admin'),
  createHackathon
);

router.get(
  '/organizer/all',
  protect,
  authorizeRoles('organizer', 'admin'),
  getOrganizerHackathons
);

router.put(
  '/:id',
  protect,
  authorizeRoles('organizer', 'admin'),
  updateHackathon
);

router.delete(
  '/:id',
  protect,
  authorizeRoles('organizer', 'admin'),
  deleteHackathon
);

export default router;
