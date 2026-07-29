import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    projectName: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a project description'],
    },
    githubRepo: {
      type: String,
      required: [true, 'Please add a GitHub repository URL'],
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      trim: true,
    },
    screenshots: {
      type: [String],
      default: [],
    },
    presentationPdf: {
      type: String,
      trim: true,
    },
    demoVideoLink: {
      type: String,
      trim: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
