import express from 'express';
import {
  createReturnRequest,
  getMyReturns,
  getReturnById,
  cancelReturnRequest,
} from '../../controllers/customer/returnController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createReturnRequest);

router.route('/my-returns')
  .get(getMyReturns);

router.route('/:id')
  .get(getReturnById);

router.route('/:id/cancel')
  .patch(cancelReturnRequest);

export default router;
