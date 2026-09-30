// tests/unit/auditLogger.test.js
const { logSecurityEvent, SecurityEvent, getClientIp } = require('../../utils/auditLogger');
const logger = require('../../utils/logger');

describe('Security Audit Logging', () => {
  let infoSpy;
  let warnSpy;

  beforeEach(() => {
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('should format and log a successful login audit event', () => {
    const mockReq = {
      ip: '192.168.1.100',
      headers: { 'user-agent': 'Mozilla/5.0 Jest Test Browser' },
    };

    const payload = logSecurityEvent({
      event: SecurityEvent.LOGIN_SUCCESS,
      userId: 'user_123',
      req: mockReq,
      status: 'SUCCESS',
      metadata: { email: 'user@example.com' },
    });

    expect(payload.audit).toBe(true);
    expect(payload.eventType).toBe(SecurityEvent.LOGIN_SUCCESS);
    expect(payload.userId).toBe('user_123');
    expect(payload.ip).toBe('192.168.1.100');
    expect(payload.status).toBe('SUCCESS');
    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('should log a security warning for failed login or unauthorized access', () => {
    const mockReq = {
      headers: {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18',
        'user-agent': 'curl/7.68.0',
      },
    };

    const payload = logSecurityEvent({
      event: SecurityEvent.LOGIN_FAILURE,
      req: mockReq,
      status: 'FAILURE',
      metadata: { reason: 'Invalid password', email: 'attacker@example.com' },
    });

    expect(payload.eventType).toBe(SecurityEvent.LOGIN_FAILURE);
    expect(payload.ip).toBe('203.0.113.195');
    expect(payload.status).toBe('FAILURE');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('should correctly extract IP from forwarded headers', () => {
    const req = { headers: { 'x-forwarded-for': '198.51.100.1, 198.51.100.2' } };
    expect(getClientIp(req)).toBe('198.51.100.1');
  });
});
