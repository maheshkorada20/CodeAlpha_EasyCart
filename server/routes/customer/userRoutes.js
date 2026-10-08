import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../../controllers/customer/userController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/change-password', changeUserPassword);

export default router;
