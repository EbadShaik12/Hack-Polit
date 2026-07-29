import Feedback from '../models/feedbackModel.js';
import Hackathon from '../models/hackathonModel.js';
import { logActivity } from './activityController.js';

// @desc    Submit or update feedback for a hackathon
// @route   POST /api/feedback
// @access  Private (Participants/Users)
export const submitFeedback = async (req, res, next) => {
  try {
    const { hackathonId, rating, comment } = req.body;

    if (!hackathonId || !rating || !comment) {
      res.status(400);
      throw new Error('Please provide hackathon ID, rating (1-5 stars), and comment');
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400);
      throw new Error('Rating must be an integer between 1 and 5');
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Check if event has ended
    const isEnded = new Date(hackathon.endDate) <= new Date();
    if (!isEnded && process.env.NODE_ENV !== 'test') {
      res.status(400);
      throw new Error('Feedback submission opens after the hackathon has ended');
    }

    // Create or update existing feedback
    const feedback = await Feedback.findOneAndUpdate(
      { participant: req.user._id, hackathon: hackathonId },
      {
        participant: req.user._id,
        hackathon: hackathonId,
        rating: numericRating,
        comment,
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('participant', 'name email');

    await logActivity(
      `User "${req.user.name}" rated "${hackathon.title}" ${numericRating}/5 stars.`,
      'feedback'
    );

    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's feedback for a specific hackathon
// @route   GET /api/feedback/my-feedback/:hackathonId
// @access  Private
export const getMyFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({
      participant: req.user._id,
      hackathon: req.params.hackathonId,
    });

    res.status(200).json(feedback || null);
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback summary and reviews for a single hackathon
// @route   GET /api/feedback/hackathon/:hackathonId
// @access  Public
export const getHackathonFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ hackathon: req.params.hackathonId })
      .populate('participant', 'name')
      .sort({ createdAt: -1 });

    const totalCount = feedbacks.length;
    const totalScore = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const avgRating = totalCount > 0 ? Number((totalScore / totalCount).toFixed(1)) : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      if (breakdown[f.rating] !== undefined) {
        breakdown[f.rating]++;
      }
    });

    res.status(200).json({
      avgRating,
      totalCount,
      breakdown,
      reviews: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback and average ratings across organizer's hackathons
// @route   GET /api/feedback/organizer/all
// @access  Private (Organizer/Admin)
export const getOrganizerFeedbackOverview = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { organizer: req.user._id };
    const myHackathons = await Hackathon.find(query);
    const hackathonIds = myHackathons.map((h) => h._id);

    const allFeedbacks = await Feedback.find({ hackathon: { $in: hackathonIds } })
      .populate('participant', 'name email')
      .populate('hackathon', 'title status endDate')
      .sort({ createdAt: -1 });

    const totalScoreAll = allFeedbacks.reduce((sum, f) => sum + f.rating, 0);
    const overallAvgRating =
      allFeedbacks.length > 0 ? Number((totalScoreAll / allFeedbacks.length).toFixed(1)) : 0;

    const perHackathonFeedback = myHackathons.map((h) => {
      const hFeedbacks = allFeedbacks.filter(
        (f) => f.hackathon && f.hackathon._id.toString() === h._id.toString()
      );
      const hCount = hFeedbacks.length;
      const hSum = hFeedbacks.reduce((acc, f) => acc + f.rating, 0);
      const hAvg = hCount > 0 ? Number((hSum / hCount).toFixed(1)) : 0;

      return {
        hackathonId: h._id,
        title: h.title,
        status: h.status,
        endDate: h.endDate,
        isEnded: new Date(h.endDate) <= new Date(),
        count: hCount,
        avgRating: hAvg,
        reviews: hFeedbacks,
      };
    });

    res.status(200).json({
      totalFeedbacks: allFeedbacks.length,
      overallAvgRating,
      perHackathonFeedback,
      allReviews: allFeedbacks,
    });
  } catch (error) {
    next(error);
  }
};
