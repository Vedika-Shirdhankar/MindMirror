// tests/unit/googleAuth.test.js
const { googleAuth } = require('../../controllers/authController');
const User = require('../../models/User');

jest.mock('../../models/User');
jest.mock('../../utils/generateToken', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token-123'),
}));
jest.mock('../../utils/auditLogger', () => ({
  logSecurityEvent: jest.fn(),
  SecurityEvent: {
    SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  },
}));

describe('Google Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if neither credential nor accessToken is provided', async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await googleAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });
});
