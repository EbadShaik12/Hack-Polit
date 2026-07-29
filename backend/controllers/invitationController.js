import Invitation from '../models/invitationModel.js';
import Team from '../models/teamModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { logActivity } from './activityController.js';

// @desc    Send team invitation by email
// @route   POST /api/teams/invitations
// @access  Private (Team Leader)
export const sendInvitation = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please enter member email address');
    }

    const invitee = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitee) {
      res.status(404);
      throw new Error('No user found with this email address');
    }

    if (invitee._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot invite yourself');
    }

    // Get leader's team
    const team = await Team.findOne({ leader: req.user._id }).populate('hackathon', 'title');
    if (!team) {
      res.status(404);
      throw new Error('You are not the leader of any active team');
    }

    // Check if user is already in this team
    if (team.members.some((m) => m.toString() === invitee._id.toString())) {
      res.status(400);
      throw new Error('User is already a member of your team');
    }

    // Check if user is in another team for this hackathon
    const existingTeam = await Team.findOne({
      hackathon: team.hackathon._id,
      members: invitee._id,
    });
    if (existingTeam) {
      res.status(400);
      throw new Error('User is already registered in another team for this hackathon');
    }

    // Check if pending invitation already exists
    const existingInvite = await Invitation.findOne({
      team: team._id,
      invitee: invitee._id,
      status: 'pending',
    });
    if (existingInvite) {
      res.status(400);
      throw new Error('An invitation has already been sent to this user');
    }

    // Create invitation
    const invitation = await Invitation.create({
      team: team._id,
      hackathon: team.hackathon._id,
      inviter: req.user._id,
      invitee: invitee._id,
      status: 'pending',
    });

    // Notify invitee
    await Notification.create({
      recipient: invitee._id,
      title: 'Team Invitation',
      message: `${req.user.name} invited you to join team "${team.name}" for "${team.hackathon.title}".`,
      type: 'team',
    });

    await logActivity(
      `Invitation sent to ${invitee.name} for team "${team.name}".`,
      'registration'
    );

    const populated = await Invitation.findById(invitation._id)
      .populate('invitee', 'name email role')
      .populate('team', 'name')
      .populate('hackathon', 'title');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending invitations for the logged-in user
// @route   GET /api/teams/invitations/my-invitations
// @access  Private
export const getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({
      invitee: req.user._id,
      status: 'pending',
    })
      .populate('team', 'name members')
      .populate('inviter', 'name email')
      .populate('hackathon', 'title venue startDate endDate')
      .sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invitations sent by the team leader
// @route   GET /api/teams/invitations/sent
// @access  Private (Team Leader)
export const getSentInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find({ inviter: req.user._id })
      .populate('invitee', 'name email')
      .populate('team', 'name')
      .populate('hackathon', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept team invitation
// @route   PUT /api/teams/invitations/:id/accept
// @access  Private (Invitee)
export const acceptInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('team')
      .populate('inviter', 'name email');

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    if (invitation.invitee.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to respond to this invitation');
    }

    if (invitation.status !== 'pending') {
      res.status(400);
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    const team = await Team.findById(invitation.team._id);
    if (!team) {
      res.status(404);
      throw new Error('Team no longer exists');
    }

    // Check if user joined another team in the meantime
    const inOtherTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: req.user._id,
    });
    if (inOtherTeam) {
      invitation.status = 'rejected';
      await invitation.save();
      res.status(400);
      throw new Error('You are already registered in another team for this hackathon');
    }

    // Add user to team members list automatically
    if (!team.members.includes(req.user._id)) {
      team.members.push(req.user._id);
      await team.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Notify team leader
    await Notification.create({
      recipient: invitation.inviter._id,
      title: 'Invitation Accepted',
      message: `${req.user.name} accepted your invitation to join team "${team.name}".`,
      type: 'team',
    });

    await logActivity(`${req.user.name} joined team "${team.name}".`, 'registration');

    // Return updated team
    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('leader', 'name email role')
      .populate('hackathon');

    res.status(200).json({
      message: `You have joined team "${team.name}"!`,
      team: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject team invitation
// @route   PUT /api/teams/invitations/:id/reject
// @access  Private (Invitee)
export const rejectInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id).populate('team', 'name');

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    if (invitation.invitee.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to respond to this invitation');
    }

    if (invitation.status !== 'pending') {
      res.status(400);
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    invitation.status = 'rejected';
    await invitation.save();

    // Notify team leader
    await Notification.create({
      recipient: invitation.inviter,
      title: 'Invitation Declined',
      message: `${req.user.name} declined your invitation to join team "${invitation.team?.name || 'your team'}".`,
      type: 'team',
    });

    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/Delete sent invitation
// @route   DELETE /api/teams/invitations/:id
// @access  Private (Team Leader)
export const cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      res.status(404);
      throw new Error('Invitation not found');
    }

    if (invitation.inviter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to cancel this invitation');
    }

    await Invitation.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Invitation cancelled' });
  } catch (error) {
    next(error);
  }
};
