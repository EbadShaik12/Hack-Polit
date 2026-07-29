import express from 'express';
import {
  registerUser,
  loginUser,
  adminLoginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLoginUser);
router.get('/users', protect, authorizeRoles('organizer', 'admin'), getAllUsers);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
