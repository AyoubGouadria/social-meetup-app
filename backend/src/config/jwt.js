const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_secret_key',
  expiresIn: process.env.JWT_EXPIRE || '7d'
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

module.exports = {
  generateToken,
  verifyToken,
  jwtConfig
};
