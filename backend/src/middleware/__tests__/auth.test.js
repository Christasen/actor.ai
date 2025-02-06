const jwt = require('jsonwebtoken');
const auth = require('../auth');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {
        authorization: 'Bearer valid-token'
      }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  test('passes with valid admin token', () => {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET);
    mockReq.headers.authorization = `Bearer ${token}`;

    auth(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.userData).toBeDefined();
    expect(mockReq.userData.isAdmin).toBe(true);
  });

  test('rejects non-admin token', () => {
    const token = jwt.sign({ isAdmin: false }, process.env.JWT_SECRET);
    mockReq.headers.authorization = `Bearer ${token}`;

    auth(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Admin access required'
    });
  });

  test('rejects invalid token', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';

    auth(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Authentication failed'
    });
  });

  test('rejects missing token', () => {
    mockReq.headers.authorization = undefined;

    auth(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Authentication failed'
    });
  });
}); 