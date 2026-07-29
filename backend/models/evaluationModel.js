import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    scores: {
      innovation: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      ui: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      functionality: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      documentation: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
      scalability: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
      },
    },
    comments: {
      type: String,
      trim: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate total score
evaluationSchema.pre('validate', function (next) {
  if (this.scores) {
    this.totalScore =
      (this.scores.innovation || 0) +
      (this.scores.ui || 0) +
      (this.scores.functionality || 0) +
      (this.scores.documentation || 0) +
      (this.scores.scalability || 0);
  }
  next();
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);

export default Evaluation;
