// utils/generateToken.js
const jwt = require('jsonwebtoken');

function generateToken(userId) {
  // Signs a token with user's ObjectId. Fallback to 'secret' if JWT_SECRET is not in env.
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });
}

module.exports = { generateToken };
