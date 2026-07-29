import Hackathon from '../models/hackathonModel.js';
import User from '../models/userModel.js';
import Team from '../models/teamModel.js';
import Submission from '../models/submissionModel.js';
import Evaluation from '../models/evaluationModel.js';
import { logActivity } from './activityController.js';

// @desc    Create a new hackathon
// @route   POST /api/hackathons
// @access  Private (Organizer only)
export const createHackathon = async (req, res, next) => {
  try {
    const {
      title,
      description,
      theme,
      startDate,
      endDate,
      venue,
      bannerImage,
      registrationDeadline,
      rules,
      judgingCriteria,
    } = req.body;

    // Build the hackathon item and link it to req.user._id
    const hackathon = await Hackathon.create({
      title,
      description,
      theme,
      startDate,
      endDate,
      venue,
      bannerImage,
      registrationDeadline,
      rules,
      judgingCriteria,
      organizer: req.user._id,
      status: 'draft', // defaults to draft
    });

    res.status(201).json(hackathon);
    await logActivity(`New hackathon "${hackathon.title}" has been created.`, 'registration');
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Get all published hackathons
// @route   GET /api/hackathons
// @access  Public
export const getHackathons = async (req, res, next) => {
  try {
    // Only return published hackathons for public browsing
    const hackathons = await Hackathon.find({ status: 'published' }).populate(
      'organizer',
      'name email'
    );
    res.status(200).json(hackathons);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hackathons owned by the logged in Organizer
// @route   GET /api/hackathons/organizer
// @access  Private (Organizer only)
export const getOrganizerHackathons = async (req, res, next) => {
  try {
    const hackathons = await Hackathon.find({ organizer: req.user._id });
    res.status(200).json(hackathons);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hackathon details by ID
// @route   GET /api/hackathons/:id
// @access  Public
export const getHackathonById = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate(
      'organizer',
      'name email'
    );

    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    res.status(200).json(hackathon);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a hackathon
// @route   PUT /api/hackathons/:id
// @access  Private (Organizer only)
export const updateHackathon = async (req, res, next) => {
  try {
    let hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Secure check: verify that the caller is the organizer who created it (or is admin)
    if (
      hackathon.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to modify this hackathon');
    }

    // Perform updates
    hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (req.body.status === 'published') {
      await logActivity(`Hackathon "${hackathon.title}" has been published!`, 'publish');
    }

    res.status(200).json(hackathon);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Organizer only)
export const deleteHackathon = async (req, res, next) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Secure check: verify that the caller is the organizer who created it (or is admin)
    if (
      hackathon.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to delete this hackathon');
    }

    await Hackathon.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Hackathon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark on a hackathon (add if not bookmarked, remove if already bookmarked)
// @route   POST /api/hackathons/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res, next) => {
  try {
    const hackathonId = req.params.id;
    const userId = req.user._id;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Check if already bookmarked
    const user = await User.findById(userId);
    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === hackathonId.toString()
    );

    if (isBookmarked) {
      // Remove bookmark
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarks: hackathonId },
      });
      return res.status(200).json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      // Add bookmark
      await User.findByIdAndUpdate(userId, {
        $addToSet: { bookmarks: hackathonId },
      });
      return res.status(200).json({ bookmarked: true, message: 'Hackathon bookmarked' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookmarked hackathons for the current user
// @route   GET /api/hackathons/bookmarks
// @access  Private
export const getBookmarks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'organizer', select: 'name' },
    });

    res.status(200).json(user.bookmarks || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive organizer insights (progress bars, stats, themes, review completion)
// @route   GET /api/hackathons/organizer/insights
// @access  Private (Organizer/Admin only)
export const getOrganizerInsights = async (req, res, next) => {
  try {
    const isOrganizerOrAdmin = req.user.role === 'organizer' || req.user.role === 'admin';
    if (!isOrganizerOrAdmin) {
      res.status(403);
      throw new Error('Not authorized to access organizer insights');
    }

    const query = req.user.role === 'admin' ? {} : { organizer: req.user._id };
    const myHackathons = await Hackathon.find(query);
    const hackathonIds = myHackathons.map((h) => h._id);

    // Fetch related teams, submissions, and evaluations
    const teams = await Team.find({ hackathon: { $in: hackathonIds } }).populate('members');
    const submissions = await Submission.find({ hackathon: { $in: hackathonIds } });
    const evaluations = await Evaluation.find({ hackathon: { $in: hackathonIds } });

    // Calculate unique participants registered
    const participantIdSet = new Set();
    teams.forEach((t) => {
      t.members.forEach((m) => participantIdSet.add(m._id ? m._id.toString() : m.toString()));
    });
    const totalParticipantsCount = participantIdSet.size;

    // Experience level stats among participants
    const participantsList = await User.find({
      _id: { $in: Array.from(participantIdSet) },
    });

    const expCounts = { Beginner: 0, Intermediate: 0, Expert: 0 };
    const skillMap = {};

    participantsList.forEach((u) => {
      if (u.experience && expCounts[u.experience] !== undefined) {
        expCounts[u.experience]++;
      } else {
        expCounts['Beginner']++;
      }
      if (Array.isArray(u.skills)) {
        u.skills.forEach((sk) => {
          const sName = sk.trim();
          if (sName) {
            skillMap[sName] = (skillMap[sName] || 0) + 1;
          }
        });
      }
    });

    // Top skills list
    const topSkills = Object.entries(skillMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Review completion
    const evaluatedSubmissionIds = new Set(evaluations.map((e) => e.submission.toString()));
    const evaluatedCount = evaluatedSubmissionIds.size;
    const totalSubmissionsCount = submissions.length;
    const reviewCompletionPct = totalSubmissionsCount > 0 
      ? Math.round((evaluatedCount / totalSubmissionsCount) * 100) 
      : 0;

    // Submission progress
    const totalTeamsCount = teams.length;
    const submissionProgressPct = totalTeamsCount > 0 
      ? Math.round((totalSubmissionsCount / totalTeamsCount) * 100) 
      : 0;

    // Registration progress (target e.g. 500 default or based on hackathons count * 50)
    const targetCapacity = Math.max(myHackathons.length * 50, 100);
    const registrationProgressPct = Math.min(
      Math.round((totalParticipantsCount / targetCapacity) * 100),
      100
    );

    // Top Themes breakdown
    const themeMap = {};
    myHackathons.forEach((h) => {
      const themeName = h.theme || 'General Hackathon';
      themeMap[themeName] = (themeMap[themeName] || 0) + 1;
    });

    const totalThemesCount = myHackathons.length || 1;
    const topThemes = Object.entries(themeMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalThemesCount) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Per Hackathon detailed breakdown
    const perHackathonStats = myHackathons.map((h) => {
      const hTeams = teams.filter((t) => t.hackathon.toString() === h._id.toString());
      const hSubs = submissions.filter((s) => s.hackathon.toString() === h._id.toString());
      const hEvals = evaluations.filter((e) => e.hackathon.toString() === h._id.toString());
      
      const hEvaluatedSubIds = new Set(hEvals.map((e) => e.submission.toString()));
      const hReviewPct = hSubs.length > 0 ? Math.round((hEvaluatedSubIds.size / hSubs.length) * 100) : 0;
      const hSubPct = hTeams.length > 0 ? Math.round((hSubs.length / hTeams.length) * 100) : 0;

      return {
        id: h._id,
        title: h.title,
        theme: h.theme,
        status: h.status,
        teamsCount: hTeams.length,
        submissionsCount: hSubs.length,
        evaluationsCount: hEvals.length,
        submissionProgressPct: hSubPct,
        reviewCompletionPct: hReviewPct,
      };
    });

    res.status(200).json({
      totalHackathons: myHackathons.length,
      publishedCount: myHackathons.filter((h) => h.status === 'published').length,
      draftCount: myHackathons.filter((h) => h.status === 'draft').length,
      totalTeams: totalTeamsCount,
      totalParticipants: totalParticipantsCount,
      targetCapacity,
      registrationProgressPct,
      totalSubmissions: totalSubmissionsCount,
      submissionProgressPct,
      evaluatedSubmissions: evaluatedCount,
      totalEvaluations: evaluations.length,
      reviewCompletionPct,
      experienceBreakdown: expCounts,
      topSkills,
      topThemes,
      perHackathonStats,
    });
  } catch (error) {
    next(error);
  }
};

