import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/infrastructure/config/env.config', () => ({
  env: { JWT_SECRET: 'test-secret-key-for-unit-tests' },
}));

const mockVerify = vi.fn();
vi.mock('jsonwebtoken', () => ({
  verify: (...args: any[]) => mockVerify(...args),
}));

import { authenticateToken, requireRole } from '@/infrastructure/http/middlewares/AuthMiddleware';

const mockRes = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  return res;
};

const mockNext = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authenticateToken', () => {
  it('returns 401 when no Authorization header is present', () => {
    const req: any = { headers: {} };
    const res = mockRes();

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. No token provided.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header has no Bearer token', () => {
    const req: any = { headers: { authorization: 'Bearer ' } };
    const res = mockRes();

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next and sets req.user when token is valid', () => {
    const decoded = { userId: 'abc-123', role: 'student', email: 'test@anahuac.mx' };
    mockVerify.mockReturnValue(decoded);

    const req: any = { headers: { authorization: 'Bearer valid-token' } };
    const res = mockRes();

    authenticateToken(req, res, mockNext);

    expect(mockVerify).toHaveBeenCalledWith('valid-token', 'test-secret-key-for-unit-tests');
    expect(req.user).toEqual(decoded);
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when jwt.verify throws', () => {
    mockVerify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const req: any = { headers: { authorization: 'Bearer expired-token' } };
    const res = mockRes();

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or expired token.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('returns 403 when req.user is undefined', () => {
    const req: any = {};
    const res = mockRes();
    const middleware = requireRole(['admin']);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Access denied. Insufficient role permissions.',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next when user has the required role', () => {
    const req: any = { user: { userId: '1', role: 'admin', email: 'a@a.mx' } };
    const res = mockRes();
    const middleware = requireRole(['admin']);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user has an insufficient role', () => {
    const req: any = { user: { userId: '1', role: 'student', email: 'a@a.mx' } };
    const res = mockRes();
    const middleware = requireRole(['admin', 'manager']);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next when user role matches any of multiple allowed roles', () => {
    const req: any = { user: { userId: '1', role: 'manager', email: 'a@a.mx' } };
    const res = mockRes();
    const middleware = requireRole(['admin', 'manager']);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
