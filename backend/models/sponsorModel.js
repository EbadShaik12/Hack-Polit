import mongoose from 'mongoose';

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a sponsor name'],
      trim: true,
    },
    logoUrl: {
      type: String,
      required: [true, 'Please add a sponsor logo URL'],
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: '',
    },
    tier: {
      type: String,
      enum: ['Title', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Community', 'Media Partner'],
      default: 'Gold',
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
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

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

export default Sponsor;
