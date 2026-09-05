module.exports = {
  secret: process.env.JWT_SECRET || 'fallback-dev-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d'
};
