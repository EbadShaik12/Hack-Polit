import User from '../models/userModel.js';

// Helper to calculate Jaccard similarity (intersect over union)
const calculateOverlap = (arr1, arr2) => {
  if (!arr1.length || !arr2.length) return 0;
  
  const set1 = new Set(arr1.map(s => s.toLowerCase().trim()));
  const set2 = new Set(arr2.map(s => s.toLowerCase().trim()));
  
  const intersect = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersect.size / union.size;
};

// Helper to calculate experience match (out of 20)
const calculateExperienceScore = (exp1, exp2) => {
  const levels = { 'Beginner': 0, 'Intermediate': 1, 'Expert': 2 };
  
  const val1 = levels[exp1] !== undefined ? levels[exp1] : 0;
  const val2 = levels[exp2] !== undefined ? levels[exp2] : 0;
  
  const diff = Math.abs(val1 - val2);
  
  if (diff === 0) return 20; // Exact match
  if (diff === 1) return 10; // 1 level difference
  return 0; // 2 levels difference
};

// @desc    Get compatible teammates based on skills, interests, and experience
// @route   GET /api/matches
// @access  Private (Participant only)
export const getCompatibleTeammates = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      res.status(404);
      throw new Error('User not found');
    }

    // Fetch other participants
    const otherParticipants = await User.find({
      role: 'participant',
      _id: { $ne: currentUser._id }
    });

    const userSkills = currentUser.skills || [];
    const userInterests = currentUser.interests || [];
    const userExp = currentUser.experience || 'Beginner';

    const matches = otherParticipants.map(participant => {
      const partSkills = participant.skills || [];
      const partInterests = participant.interests || [];
      const partExp = participant.experience || 'Beginner';

      // 40% skills compatibility
      const skillsOverlap = calculateOverlap(userSkills, partSkills);
      const skillsScore = skillsOverlap * 40;

      // 40% interests compatibility
      const interestsOverlap = calculateOverlap(userInterests, partInterests);
      const interestsScore = interestsOverlap * 40;

      // 20% experience compatibility
      const expScore = calculateExperienceScore(userExp, partExp);

      const totalPercentage = Math.round(skillsScore + interestsScore + expScore);

      return {
        _id: participant._id,
        name: participant.name,
        email: participant.email,
        skills: partSkills,
        interests: partInterests,
        experience: partExp,
        matchPercentage: totalPercentage
      };
    });

    // Sort descending by percentage
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // Limit to top 6 compatible members
    const topMatches = matches.slice(0, 6);

    res.status(200).json(topMatches);
  } catch (error) {
    next(error);
  }
};
