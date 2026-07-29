import Evaluation from '../models/evaluationModel.js';
import Submission from '../models/submissionModel.js';
import Team from '../models/teamModel.js';
import Notification from '../models/notificationModel.js';
import { logActivity } from './activityController.js';

// @desc    Submit or update project evaluation
// @route   POST /api/evaluations
// @access  Private (Judge only)
export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId, scores, comments } = req.body;

    if (!submissionId || !scores) {
      res.status(400);
      throw new Error('Please provide submissionId and scores');
    }

    const { innovation, ui, functionality, documentation, scalability } = scores;

    // Validate scores range
    const validateScore = (val) => typeof val === 'number' && val >= 1 && val <= 10;
    if (
      !validateScore(innovation) ||
      !validateScore(ui) ||
      !validateScore(functionality) ||
      !validateScore(documentation) ||
      !validateScore(scalability)
    ) {
      res.status(400);
      throw new Error('Scores for Innovation, UI, Functionality, Documentation, and Scalability must be integers between 1 and 10');
    }

    // Find submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      res.status(404);
      throw new Error('Project submission not found');
    }

    // Upsert evaluation for this judge + submission
    let evaluation = await Evaluation.findOne({
      judge: req.user._id,
      submission: submissionId,
    });

    if (evaluation) {
      // Update existing
      evaluation.scores = { innovation, ui, functionality, documentation, scalability };
      evaluation.comments = comments || evaluation.comments;
      await evaluation.save();
    } else {
      // Create new
      evaluation = await Evaluation.create({
        judge: req.user._id,
        submission: submissionId,
        hackathon: submission.hackathon,
        scores: { innovation, ui, functionality, documentation, scalability },
        comments,
      });
    }

    // Notify team members
    const team = await Team.findById(submission.team);
    if (team && team.members) {
      for (const memberId of team.members) {
        await Notification.create({
          recipient: memberId,
          title: 'Project Evaluated',
          message: `Your project "${submission.projectName}" has been evaluated by a judge. Check your score now!`,
          type: 'grade',
        });
      }
    }

    await logActivity(`A judge evaluated submission SUB-${submission._id.toString().slice(-6).toUpperCase()}.`, 'review');

    res.status(200).json(evaluation);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all evaluation sheets graded by current judge
// @route   GET /api/evaluations/my-scores
// @access  Private (Judge only)
export const getJudgeScores = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({ judge: req.user._id });
    res.status(200).json(evaluations);
  } catch (error) {
    next(error);
  }
};

// @desc    Get ranked leaderboard for a hackathon
// @route   GET /api/evaluations/leaderboard/:hackathonId
// @access  Private (Registered users)
export const getHackathonLeaderboard = async (req, res, next) => {
  try {
    const { hackathonId } = req.params;

    // Fetch all submissions for this hackathon
    const submissions = await Submission.find({ hackathon: hackathonId })
      .populate('team', 'name');

    const leaderboard = await Promise.all(
      submissions.map(async (sub) => {
        // Fetch all evaluations for this submission
        const evals = await Evaluation.find({ submission: sub._id });
        const count = evals.length;

        let avgInnovation = 0;
        let avgUi = 0;
        let avgFunctionality = 0;
        let avgDocumentation = 0;
        let avgScalability = 0;
        let avgTotal = 0;

        if (count > 0) {
          const sumInnovation = evals.reduce((a, b) => a + b.scores.innovation, 0);
          const sumUi = evals.reduce((a, b) => a + b.scores.ui, 0);
          const sumFunctionality = evals.reduce((a, b) => a + b.scores.functionality, 0);
          const sumDocumentation = evals.reduce((a, b) => a + b.scores.documentation, 0);
          const sumScalability = evals.reduce((a, b) => a + b.scores.scalability, 0);
          const sumTotal = evals.reduce((a, b) => a + b.totalScore, 0);

          avgInnovation = parseFloat((sumInnovation / count).toFixed(1));
          avgUi = parseFloat((sumUi / count).toFixed(1));
          avgFunctionality = parseFloat((sumFunctionality / count).toFixed(1));
          avgDocumentation = parseFloat((sumDocumentation / count).toFixed(1));
          avgScalability = parseFloat((sumScalability / count).toFixed(1));
          avgTotal = parseFloat((sumTotal / count).toFixed(1));
        }

        return {
          submissionId: sub._id,
          projectName: sub.projectName,
          githubRepo: sub.githubRepo,
          teamName: sub.team ? sub.team.name : 'Independent User',
          averages: {
            innovation: avgInnovation,
            ui: avgUi,
            functionality: avgFunctionality,
            documentation: avgDocumentation,
            scalability: avgScalability,
          },
          avgTotal,
          reviewCount: count,
        };
      })
    );

    // Sort descending by average total score
    leaderboard.sort((a, b) => b.avgTotal - a.avgTotal);

    // Assign positions/ranks
    const rankedLeaderboard = leaderboard.map((item, idx) => ({
      position: idx + 1,
      ...item,
    }));

    res.status(200).json(rankedLeaderboard);
  } catch (error) {
    next(error);
  }
};
