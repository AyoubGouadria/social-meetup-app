/**
 * Age Verification Middleware
 * Ensures users have verified they are 18+ before accessing protected features
 * 
 * Required by German Youth Protection Act (JuSchG)
 */

const requireAgeVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.ageVerified) {
      return res.status(403).json({
        success: false,
        message: 'Age verification required. You must confirm you are 18 or older.',
        requiresAction: 'AGE_VERIFICATION',
        code: 'AGE_NOT_VERIFIED'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Age verification check failed',
      error: error.message
    });
  }
};

/**
 * Email Verification Middleware (optional - for sensitive operations)
 */
const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required. Please check your inbox.',
        requiresAction: 'EMAIL_VERIFICATION',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Email verification check failed',
      error: error.message
    });
  }
};

module.exports = {
  requireAgeVerification,
  requireEmailVerification
};
