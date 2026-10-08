import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../controllers/customer/notificationController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.patch('/read-all', markAllAsRead);

router.route('/:id')
  .delete(deleteNotification);

router.patch('/:id/read', markAsRead);

export default router;
