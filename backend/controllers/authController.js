import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    {
      expiresIn: '30d', // Token expires in 30 days
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please fill in all fields (name, email, password)');
    }

    // Check if user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    // Restrict public registration from self-assigning admin role
    const assignedRole = role === 'admin' ? 'participant' : (role || 'participant');

    // Create the user (password hashing is handled by pre-save middleware in userModel.js)
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user by email and explicitly select password (since it is set to select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    // Verify user exists and check if password matches hashed database value
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate admin user & get token (Dedicated Admin Portal Login)
// @route   POST /api/auth/admin-login
// @access  Public (Strict Role Verification)
export const adminLoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide admin email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid admin email or password');
    }

    if (user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied. This login portal is strictly reserved for System Administrators.');
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills || [],
        interests: user.interests || [],
        experience: user.experience || 'Beginner',
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.skills !== undefined) {
        user.skills = Array.isArray(req.body.skills)
          ? req.body.skills
          : req.body.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (req.body.interests !== undefined) {
        user.interests = Array.isArray(req.body.interests)
          ? req.body.interests
          : req.body.interests.split(',').map((i) => i.trim()).filter(Boolean);
      }
      if (req.body.experience !== undefined) {
        user.experience = req.body.experience;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        experience: updatedUser.experience,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all participant users
// @route   GET /api/auth/users
// @access  Private (Organizer/Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'participant' });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
