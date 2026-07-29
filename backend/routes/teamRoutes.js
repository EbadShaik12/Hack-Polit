import express from 'express';
import {
  createTeam,
  inviteMember,
  removeMember,
  transferLeadership,
  deleteTeam,
  getUserTeam,
  getHackathonTeams,
} from '../controllers/teamController.js';
import {
  sendInvitation,
  getMyInvitations,
  getSentInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} from '../controllers/invitationController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Private routes for participants & teams
router.post('/', protect, createTeam);
router.get('/my-team', protect, getUserTeam);
router.post('/invite', protect, inviteMember);
router.post('/remove', protect, removeMember);
router.post('/transfer-lead', protect, transferLeadership);
router.delete('/', protect, deleteTeam);

// Team Invitations Routes
router.post('/invitations', protect, sendInvitation);
router.get('/invitations/my-invitations', protect, getMyInvitations);
router.get('/invitations/sent', protect, getSentInvitations);
router.put('/invitations/:id/accept', protect, acceptInvitation);
router.put('/invitations/:id/reject', protect, rejectInvitation);
router.delete('/invitations/:id', protect, cancelInvitation);

// Organizer protected read-only route
router.get(
  '/hackathon/:hackathonId',
  protect,
  authorizeRoles('organizer', 'admin'),
  getHackathonTeams
);

export default router;
