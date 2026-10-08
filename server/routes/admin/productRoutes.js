import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from '../../controllers/admin/productController.js';
import {
  getProductReviews,
  createProductReview,
} from '../../controllers/customer/reviewController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { admin } from '../../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:id/status')
  .patch(protect, admin, updateProductStatus);

router.route('/:productId/reviews')
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
