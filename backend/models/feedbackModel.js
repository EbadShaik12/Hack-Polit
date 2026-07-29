import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5 stars'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide feedback comments'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback from same participant for same hackathon
feedbackSchema.index({ participant: 1, hackathon: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
