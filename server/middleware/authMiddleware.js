import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import { ENV } from '../config/env.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies?.jwt;

  // Fallback to Bearer token in header (for postman testing, etc)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      if(!req.user || !req.user.isActive) {
        res.status(401);
        throw new Error('Not authorized, user disabled or not found');
      }
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
