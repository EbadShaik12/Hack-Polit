import Sponsor from '../models/sponsorModel.js';
import Hackathon from '../models/hackathonModel.js';
import { logActivity } from './activityController.js';

// @desc    Create a new sponsor
// @route   POST /api/sponsors
// @access  Private (Organizer/Admin)
export const createSponsor = async (req, res, next) => {
  try {
    const { name, logoUrl, websiteUrl, tier, hackathonId } = req.body;

    if (!name || !logoUrl || !hackathonId) {
      res.status(400);
      throw new Error('Please provide sponsor name, logo URL, and select a hackathon');
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      res.status(404);
      throw new Error('Hackathon not found');
    }

    // Verify ownership
    if (hackathon.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to add sponsors to this hackathon');
    }

    const sponsor = await Sponsor.create({
      name,
      logoUrl,
      websiteUrl: websiteUrl || '',
      tier: tier || 'Gold',
      hackathon: hackathonId,
      organizer: req.user._id,
    });

    await logActivity(`Sponsor "${name}" (${tier} tier) added to "${hackathon.title}".`, 'sponsor');

    res.status(201).json(sponsor);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sponsors for a specific hackathon
// @route   GET /api/sponsors/hackathon/:hackathonId
// @access  Public
export const getSponsorsByHackathon = async (req, res, next) => {
  try {
    const sponsors = await Sponsor.find({ hackathon: req.params.hackathonId })
      .populate('hackathon', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(sponsors);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sponsors managed by the logged in organizer
// @route   GET /api/sponsors/organizer
// @access  Private (Organizer/Admin)
export const getOrganizerSponsors = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { organizer: req.user._id };
    const sponsors = await Sponsor.find(query)
      .populate('hackathon', 'title status')
      .sort({ createdAt: -1 });

    res.status(200).json(sponsors);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a sponsor
// @route   PUT /api/sponsors/:id
// @access  Private (Organizer/Admin)
export const updateSponsor = async (req, res, next) => {
  try {
    let sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      res.status(404);
      throw new Error('Sponsor not found');
    }

    if (sponsor.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to edit this sponsor');
    }

    sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('hackathon', 'title');

    res.status(200).json(sponsor);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a sponsor
// @route   DELETE /api/sponsors/:id
// @access  Private (Organizer/Admin)
export const deleteSponsor = async (req, res, next) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);

    if (!sponsor) {
      res.status(404);
      throw new Error('Sponsor not found');
    }

    if (sponsor.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this sponsor');
    }

    await Sponsor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Sponsor deleted successfully' });
  } catch (error) {
    next(error);
  }
};
