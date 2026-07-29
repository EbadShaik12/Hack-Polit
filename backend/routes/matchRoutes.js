import express from 'express';
import { getCompatibleTeammates } from '../controllers/matchController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  authorizeRoles('participant'),
  getCompatibleTeammates
);

export default router;
