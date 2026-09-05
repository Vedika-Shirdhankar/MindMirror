// utils/generateToken.js
const jwt = require('jsonwebtoken');
const config = require('../config');

function generateToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

module.exports = { generateToken };
