import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../controllers/admin/bannerController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { admin } from '../../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getActiveBanners);

// Protected Admin routes
router.get('/all', protect, admin, getAllBanners);
router.post('/', protect, admin, createBanner);
router.route('/:id')
  .get(protect, admin, getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

export default router;
