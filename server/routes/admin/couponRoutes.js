import express from 'express';
import {
  validateCoupon,
  getActiveCoupons,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
} from '../../controllers/admin/couponController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { admin } from '../../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/active', getActiveCoupons);

// Protected routes (Customer)
router.post('/validate', protect, validateCoupon);

// Admin routes
router.route('/admin')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.route('/admin/:id')
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;
