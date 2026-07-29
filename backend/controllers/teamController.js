import Team from '../models/teamModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { logActivity } from './activityController.js';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Participant only)
export const createTeam = async (req, res, next) => {
  try {
    const { name, hackathonId } = req.body;

    if (!name || !hackathonId) {
      res.status(400);
      throw new Error('Please provide team name and hackathon ID');
    }

    // Check if team name is already taken
    const nameTaken = await Team.findOne({ name });
    if (nameTaken) {
      res.status(400);
      throw new Error('Team name is already taken');
    }

    // Check if the user is already in a team for this specific hackathon
    const alreadyRegistered = await Team.findOne({
      hackathon: hackathonId,
      members: req.user._id,
    });
    if (alreadyRegistered) {
      res.status(400);
      throw new Error('You are already registered in a team for this hackathon');
    }

    // Create team
    const team = await Team.create({
      name,
      hackathon: hackathonId,
      leader: req.user._id,
      members: [req.user._id], // leader is default member
    });

    res.status(201).json(team);
    await logActivity(`Team "${team.name}" has been created for the hackathon.`, 'registration');
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to team by email
// @route   POST /api/teams/invite
// @access  Private (Team Leader only)
export const inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please enter member email');
    }

    // Find the user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      res.status(404);
      throw new Error('No user found with this email address');
    }

    // Get leader's active team
    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      res.status(404);
      throw new Error('You are not the leader of any team');
    }

    // Check if user is already a member of this team
    if (team.members.includes(userToAdd._id)) {
      res.status(400);
      throw new Error('User is already a member of your team');
    }

    // Check if user is in another team for the same hackathon
    const userInOtherTeam = await Team.findOne({
      hackathon: team.hackathon,
      members: userToAdd._id,
    });
    if (userInOtherTeam) {
      res.status(400);
      throw new Error('User is already in another team for this hackathon');
    }

    // Add user to members list
    team.members.push(userToAdd._id);
    await team.save();

    // Create notification for the joined user
    await Notification.create({
      recipient: userToAdd._id,
      title: 'Joined Hackathon Team',
      message: `You have been added to the team "${team.name}" by ${req.user.name}.`,
      type: 'team',
    });

    await logActivity(`${userToAdd.name} joined team "${team.name}".`, 'registration');

    // Populate members data
    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('leader', 'name email role');

    res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from team
// @route   POST /api/teams/remove
// @access  Private (Team Leader only)
export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      res.status(400);
      throw new Error('Please provide member ID');
    }

    // Find leader's active team
    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      res.status(404);
      throw new Error('You are not the leader of any team');
    }

    // Leader cannot remove themselves from the team
    if (memberId === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot remove yourself. Transfer leadership first.');
    }

    // Remove user
    team.members = team.members.filter((id) => id.toString() !== memberId);
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('leader', 'name email role');

    res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer team leadership
// @route   POST /api/teams/transfer-lead
// @access  Private (Team Leader only)
export const transferLeadership = async (req, res, next) => {
  try {
    const { newLeaderId } = req.body;

    if (!newLeaderId) {
      res.status(400);
      throw new Error('Please provide new leader ID');
    }

    // Find leader's team
    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      res.status(404);
      throw new Error('You are not the leader of any team');
    }

    // Check if new leader is a member of this team
    if (!team.members.includes(newLeaderId)) {
      res.status(400);
      throw new Error('New leader must be a current member of the team');
    }

    // Update leader
    team.leader = newLeaderId;
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('members', 'name email role')
      .populate('leader', 'name email role');

    res.status(200).json(updatedTeam);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams
// @access  Private (Team Leader only)
export const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      res.status(404);
      throw new Error('You are not the leader of any team');
    }

    await Team.findByIdAndDelete(team._id);

    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's active team details
// @route   GET /api/teams/my-team
// @access  Private
export const getUserTeam = async (req, res, next) => {
  try {
    // Find a team where the user is a member
    const team = await Team.findOne({ members: req.user._id })
      .populate('members', 'name email role')
      .populate('leader', 'name email role')
      .populate('hackathon');

    if (!team) {
      return res.status(200).json(null); // Return null if no team exists
    }

    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teams for a specific hackathon (Organizer only)
// @route   GET /api/teams/hackathon/:hackathonId
// @access  Private (Organizer only)
export const getHackathonTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ hackathon: req.params.hackathonId })
      .populate('members', 'name email role')
      .populate('leader', 'name email role');

    res.status(200).json(teams);
  } catch (error) {
    next(error);
  }
};
