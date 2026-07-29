import Activity from '../models/activityModel.js';

// @desc    Get latest activities (feed)
// @route   GET /api/activities
// @access  Private
export const getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive audit logs with filters (user, action type, date range)
// @route   GET /api/activities/audit-logs
// @access  Private (Admin/Organizer)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { search, user, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (user && user !== 'all') {
      filter.$or = [
        { user: user },
        { userName: new RegExp(user, 'i') },
        { userEmail: new RegExp(user, 'i') },
      ];
    }

    if (search) {
      filter.message = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const totalLogs = await Activity.countDocuments(filter);
    const logs = await Activity.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      logs,
      totalLogs,
      page: pageNum,
      totalPages: Math.ceil(totalLogs / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// Internal helper for logging events across the application
export const logActivity = async (message, type, userId = null, userName = 'System', userEmail = '') => {
  try {
    await Activity.create({
      message,
      type,
      user: userId || null,
      userName: userName || 'System',
      userEmail: userEmail || '',
    });
  } catch (error) {
    console.error('Failed to log activity event:', error.message);
  }
};
