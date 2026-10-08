import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} from '../../controllers/admin/categoryController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { admin } from '../../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/seed', protect, admin, seedCategories);

router
  .route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

router
  .route('/:id')
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
