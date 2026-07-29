import Certificate from '../models/certificateModel.js';
import User from '../models/userModel.js';
import Hackathon from '../models/hackathonModel.js';
import Notification from '../models/notificationModel.js';
import { logActivity } from './activityController.js';

// @desc    Issue a certificate to a participant
// @route   POST /api/certificates
// @access  Private (Organizer/Admin only)
export const issueCertificate = async (req, res, next) => {
  try {
    const { participantId, hackathonId, type, organizerSignature, issueDate } = req.body;

    if (!participantId || !hackathonId || !organizerSignature) {
      res.status(400);
      throw new Error('Please fill in required fields (Participant, Hackathon, Organizer Signature)');
    }

    // Verify participant user
    const participant = await User.findById(participantId);
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

    // Create certificate
    const certificate = await Certificate.create({
      participant: participantId,
      hackathon: hackathonId,
      type: type || 'participation',
      organizerSignature,
      issueDate: issueDate || Date.now(),
      issuedBy: req.user._id,
    });

    // Dispatch activity log
    await logActivity(
      `Certificate of ${type || 'participation'} issued to "${participant.name}" for "${hackathon.title}".`,
      'publish'
    );

    // Notify participant
    await Notification.create({
      recipient: participantId,
      title: 'New Certificate Issued 🎓',
      message: `You have been awarded a Certificate of ${type || 'participation'} for "${hackathon.title}"!`,
      type: 'system',
    });

    res.status(201).json(certificate);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current participant's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
export const getUserCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ participant: req.user._id })
      .populate('hackathon', 'title theme')
      .populate('issuedBy', 'name');

    res.status(200).json(certificates);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates issued
// @route   GET /api/certificates
// @access  Private (Organizer/Admin only)
export const getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .populate('participant', 'name email')
      .populate('hackathon', 'title theme')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(certificates);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('participant', 'name email')
      .populate('hackathon', 'title theme')
      .populate('issuedBy', 'name');

    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    res.status(200).json(certificate);
  } catch (error) {
    next(error);
  }
};
