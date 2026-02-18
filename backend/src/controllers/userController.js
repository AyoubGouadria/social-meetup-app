const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate({
        path: 'hostedEvents',
        match: { status: 'published' },
        select: 'title date location category participants'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users
// @access  Public
exports.searchUsers = async (req, res, next) => {
  try {
    const { search, city, language, page = 1, limit = 20 } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (language) {
      query.languages = language;
    }

    const users = await User.find(query)
      .select('name avatar city languages bio')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: users
    });
  } catch (error) {
    next(error);
  }
};
