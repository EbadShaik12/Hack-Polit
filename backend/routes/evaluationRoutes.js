import express from 'express';
import {
  gradeSubmission,
  getJudgeScores,
  getHackathonLeaderboard,
} from '../controllers/evaluationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Leaderboard route accessible to all authenticated roles
router.get('/leaderboard/:hackathonId', protect, getHackathonLeaderboard);

// Subsequent endpoints restricted to judges and admins
router.use(authorizeRoles('judge', 'admin'));

router.post('/', gradeSubmission);
router.get('/my-scores', getJudgeScores);

export default router;
