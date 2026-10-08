import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  unlockAdmin,
  googleAuth,
} from '../../controllers/auth/authController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/google', googleAuth);
router.post('/unlock-admin', protect, unlockAdmin);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/change-password', protect, changePassword);

// /api/auth/me alias for frontend compatibility if needed
router.get('/me', protect, getUserProfile);

export default router;
