import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRE,
  });

  // Set JWT as HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;
