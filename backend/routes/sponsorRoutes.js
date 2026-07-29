import express from 'express';
import {
  createSponsor,
  getSponsorsByHackathon,
  getOrganizerSponsors,
  updateSponsor,
  deleteSponsor,
} from '../controllers/sponsorController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/hackathon/:hackathonId', getSponsorsByHackathon);

// Protected routes (Organizer/Admin)
router.get('/organizer', protect, authorizeRoles('organizer', 'admin'), getOrganizerSponsors);
router.post('/', protect, authorizeRoles('organizer', 'admin'), createSponsor);
router.put('/:id', protect, authorizeRoles('organizer', 'admin'), updateSponsor);
router.delete('/:id', protect, authorizeRoles('organizer', 'admin'), deleteSponsor);

export default router;
