import Submission from '../models/submissionModel.js';
import Team from '../models/teamModel.js';
import Hackathon from '../models/hackathonModel.js';
import Notification from '../models/notificationModel.js';
import { logActivity } from './activityController.js';

// @desc    Create or update a project submission
// @route   POST /api/submissions
// @access  Private (Team Leader only)
export const submitProject = async (req, res, next) => {
  try {
    const {
      projectName,
      description,
      githubRepo,
      liveDemoUrl,
      screenshots,
      presentationPdf,
      demoVideoLink,
      techStack,
    } = req.body;

    if (!projectName || !description || !githubRepo) {
      res.status(400);
      throw new Error('Please fill in required fields (Project Name, Description, GitHub Repo)');
    }

    // Find the team where the current user is the leader
    const team = await Team.findOne({ leader: req.user._id });
    if (!team) {
      res.status(403);
      throw new Error('Only the team leader can submit the project');
    }

    // Get hackathon to verify the deadline has not passed
    const hackathon = await Hackathon.findById(team.hackathon);
    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Strict deadline check: compare current time with registrationDeadline or endDate
    const deadline = hackathon.endDate || hackathon.registrationDeadline;
    if (deadline && new Date() > new Date(deadline)) {
      res.status(400);
      throw new Error('The hackathon submission deadline has passed');
    }

    // Format screenshots as array of strings
    const screenshotsArray = Array.isArray(screenshots)
      ? screenshots
      : typeof screenshots === 'string'
      ? screenshots.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    // Format techStack as array of strings
    const techStackArray = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
      ? techStack.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Check if team already submitted a project
    let submission = await Submission.findOne({ team: team._id });
    const isUpdate = !!submission;

    if (submission) {
      // Update existing submission
      submission.projectName = projectName;
      submission.description = description;
      submission.githubRepo = githubRepo;
      submission.liveDemoUrl = liveDemoUrl || submission.liveDemoUrl;
      submission.screenshots = screenshotsArray;
      submission.presentationPdf = presentationPdf || submission.presentationPdf;
      submission.demoVideoLink = demoVideoLink || submission.demoVideoLink;
      submission.techStack = techStackArray.length ? techStackArray : submission.techStack;
      submission.submittedAt = Date.now();
      
      await submission.save();
    } else {
      // Create new submission
      submission = await Submission.create({
        team: team._id,
        hackathon: team.hackathon,
        projectName,
        description,
        githubRepo,
        liveDemoUrl,
        screenshots: screenshotsArray,
        presentationPdf,
        demoVideoLink,
        techStack: techStackArray,
      });
    }

    // Create notifications for all team members
    if (team && team.members) {
      for (const memberId of team.members) {
        await Notification.create({
          recipient: memberId,
          title: isUpdate ? 'Project Submission Updated' : 'Project Submitted Successfully',
          message: `Your team "${team.name}" has ${isUpdate ? 'updated' : 'submitted'} the project "${projectName}".`,
          type: 'submission',
        });
      }
    }

    await logActivity(`Team "${team.name}" ${isUpdate ? 'updated submission for' : 'submitted'} project "${projectName}".`, 'submission');

    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get active team's project submission
// @route   GET /api/submissions/my-team
// @access  Private (Teammates only)
export const getTeamSubmission = async (req, res, next) => {
  try {
    // Find team where current user is a member
    const team = await Team.findOne({ members: req.user._id });
    if (!team) {
      return res.status(200).json(null); // Return null if user has no team
    }

    // Find submission for this team
    const submission = await Submission.findOne({ team: team._id });
    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions for a hackathon
// @route   GET /api/submissions/hackathon/:hackathonId
// @access  Private (Organizer/Judge only)
export const getHackathonSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ hackathon: req.params.hackathonId })
      .populate({
        path: 'team',
        populate: [
          { path: 'leader', select: 'name email' },
          { path: 'members', select: 'name email' }
        ]
      });

    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get public project gallery (approved projects from ended hackathons)
// @route   GET /api/submissions/gallery
// @access  Public
export const getPublicGallery = async (req, res, next) => {
  try {
    const now = new Date();

    // Find all hackathons that have ended
    const endedHackathons = await Hackathon.find({ endDate: { $lte: now } }).select('_id title theme endDate organizer');
    const endedIds = endedHackathons.map((h) => h._id);

    // Fetch approved submissions from ended hackathons
    const submissions = await Submission.find({
      hackathon: { $in: endedIds },
      isApproved: true,
    })
      .populate({
        path: 'team',
        select: 'name leader members',
        populate: { path: 'leader', select: 'name' },
      })
      .populate('hackathon', 'title theme endDate')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or un-approve a project submission for public gallery
// @route   PATCH /api/submissions/:id/approve
// @access  Private (Organizer/Admin only)
export const approveSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      res.status(404);
      throw new Error('Submission not found');
    }

    submission.isApproved = !submission.isApproved;
    await submission.save();

    await logActivity(
      `Submission "${submission.projectName}" ${submission.isApproved ? 'approved for' : 'removed from'} public gallery.`,
      'publish'
    );

    res.status(200).json({
      message: `Project ${submission.isApproved ? 'approved for' : 'removed from'} public gallery`,
      isApproved: submission.isApproved,
    });
  } catch (error) {
    next(error);
  }
};
