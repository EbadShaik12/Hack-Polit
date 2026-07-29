import Attendance from '../models/attendanceModel.js';
import User from '../models/userModel.js';
import Hackathon from '../models/hackathonModel.js';
import Team from '../models/teamModel.js';
import Notification from '../models/notificationModel.js';
import { logActivity } from './activityController.js';

// @desc    Scan QR Code to mark participant attendance
// @route   POST /api/attendance/scan
// @access  Private (Organizer/Admin only)
export const scanQRCode = async (req, res, next) => {
  try {
    const { userId, hackathonId } = req.body;

    if (!userId || !hackathonId) {
      res.status(400);
      throw new Error('Please provide both userId and hackathonId');
    }

    // Verify participant user
    const participant = await User.findById(userId);
    if (!participant) {
      res.status(404);
      throw new Error('Participant user not found');
    }

    // Verify hackathon
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Verify participant is registered in a team for this hackathon
    const registeredTeam = await Team.findOne({
      hackathon: hackathonId,
      members: userId,
    });

    if (!registeredTeam) {
      res.status(400);
      throw new Error('Participant is not registered in any team for this hackathon');
    }

    // Upsert attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { participant: userId, hackathon: hackathonId },
      {
        status: 'present',
        scannedBy: req.user._id,
        scannedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    // Dispatch activity log
    await logActivity(
      `Participant "${participant.name}" checked in for "${hackathon.title}" via QR code.`,
      'registration'
    );

    // Notify participant
    await Notification.create({
      recipient: userId,
      title: 'Attendance Checked In',
      message: `Your attendance has been marked as Present for "${hackathon.title}".`,
      type: 'system',
    });

    res.status(200).json({
      message: `Attendance marked successfully for ${participant.name}`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get check-ins log history
// @route   GET /api/attendance/history
// @access  Private (Organizer/Admin only)
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const history = await Attendance.find()
      .populate('participant', 'name email')
      .populate('hackathon', 'title')
      .populate('scannedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current participant's attendance check-in status
// @route   GET /api/attendance/my-status/:hackathonId
// @access  Private
export const getParticipantAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findOne({
      participant: req.user._id,
      hackathon: req.params.hackathonId,
    });

    res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};
