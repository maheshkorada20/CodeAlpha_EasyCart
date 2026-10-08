import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  saveForLater,
  moveToCart,
} from '../../controllers/customer/cartController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.post('/items', addItemToCart);
router.route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

router.post('/save-for-later', saveForLater);
router.post('/move-to-cart', moveToCart);

export default router;
