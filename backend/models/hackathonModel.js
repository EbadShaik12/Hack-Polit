import mongoose from 'mongoose';

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a hackathon title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    theme: {
      type: String,
      required: [true, 'Please add a theme'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please add an end date'],
    },
    venue: {
      type: String,
      required: [true, 'Please add a venue'],
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please add a registration deadline'],
    },
    rules: {
      type: String,
      required: [true, 'Please add the hackathon rules'],
    },
    judgingCriteria: {
      type: String,
      required: [true, 'Please add the judging criteria'],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

export default Hackathon;
