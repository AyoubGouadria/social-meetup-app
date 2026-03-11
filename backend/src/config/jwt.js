const jwt = require('jsonwebtoken');

// Validate JWT_SECRET exists - fail fast if missing
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set');
  console.error('💡 Set JWT_SECRET in your .env file or environment variables');
  console.error('   Generate a secure secret with: openssl rand -base64 64');
  process.exit(1);
}

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '30d'
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Cookie options for secure JWT storage
const getCookieOptions = () => {
  return {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    path: '/'
  };
};

module.exports = {
  generateToken,
  verifyToken,
  jwtConfig,
  getCookieOptions
};
