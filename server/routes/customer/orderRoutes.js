import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
} from '../../controllers/customer/orderController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder);

router.route('/my-orders')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .patch(cancelOrder);

router.route('/:id/track')
  .get(trackOrder);

export default router;
