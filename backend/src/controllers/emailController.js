const crypto = require('crypto');
const User = require('../models/User');
// TODO: Configure email service (SendGrid, AWS SES, or Gmail SMTP)
// const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Send email verification token
 * @route   POST /api/auth/send-verification-email
 * @access  Private
 */
exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token (6-digit code or random string)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash token before saving to database
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationCode)
      .digest('hex');

    // Save token and expiry (24 hours)
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // TODO: Send email with verification code
    // const message = `Your email verification code is: ${verificationCode}\n\nThis code expires in 24 hours.`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Email Verification - Meetly',
    //   message
    // });

    // For now, return the code in development (REMOVE IN PRODUCTION)
    const responseData = {
      success: true,
      message: 'Verification code sent to your email'
    };

    // DEVELOPMENT ONLY - Remove in production
    if (process.env.NODE_ENV === 'development') {
      responseData.verificationCode = verificationCode;
      responseData.warning = 'Code shown for development only';
    }

    res.status(200).json(responseData);
  } catch (error) {
    // Reset verification fields on error
    await User.findByIdAndUpdate(req.user._id, {
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });

    next(error);
  }
};

/**
 * @desc    Verify email with token
 * @route   POST /api/auth/verify-email
 * @access  Private
 */
exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    // Hash the provided code
    const hashedToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    // Find user with matching token and non-expired date
    const user = await User.findOne({
      _id: req.user._id,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerifiedAt = Date.now();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a password reset link has been sent'
      });
    }

    // Generate reset token (6-digit code)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    // Save token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // TODO: Send email with reset code
    // const message = `Your password reset code is: ${resetCode}\n\nThis code expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password Reset - Meetly',
    //   message
    // });

    // For now, return the code in development (REMOVE IN PRODUCTION)
    const responseData = {
      success: true,
      message: 'If that email is registered, a password reset link has been sent'
    };

    // DEVELOPMENT ONLY - Remove in production
    if (process.env.NODE_ENV === 'development') {
      responseData.resetCode = resetCode;
      responseData.warning = 'Code shown for development only';
    }

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and new password are required'
      });
    }

    // Hash the provided code
    const hashedToken = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    // Find user with matching token and non-expired date
    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
