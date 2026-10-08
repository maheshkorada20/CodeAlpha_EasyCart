import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getInventory,
  updateVariantStock,
  getUsers,
  updateUserStatus,
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getReturnRequests,
  updateReturnStatus,
  getReviews,
  moderateReview,
  seedDatabase,
} from '../../controllers/admin/adminController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { admin } from '../../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.post('/seed', seedDatabase);
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Inventory
router.get('/inventory', getInventory);
router.patch('/inventory/stock', updateVariantStock);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

// Orders
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/payment-status', updatePaymentStatus);

// Returns
router.get('/returns', getReturnRequests);
router.patch('/returns/:id/status', updateReturnStatus);

// Reviews
router.get('/reviews', getReviews);
router.patch('/reviews/:id/moderation', moderateReview);

export default router;
