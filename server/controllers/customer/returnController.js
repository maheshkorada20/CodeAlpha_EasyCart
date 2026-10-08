import ReturnRequest from '../../models/ReturnRequest.js';
import Order from '../../models/Order.js';
import asyncHandler from '../../utils/asyncHandler.js';

// @desc    Create return request
// @route   POST /api/returns
// @access  Private
export const createReturnRequest = asyncHandler(async (req, res) => {
  const { orderId, items, requestType, reason, description } = req.body;

  const order = await Order.findById(orderId);

  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.orderStatus !== 'Delivered') {
    res.status(400);
    throw new Error('Can only return/exchange delivered orders');
  }

  // Check if return window is still open (7 days)
  const deliveryDate = new Date(order.deliveredAt);
  const returnWindow = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - deliveryDate.getTime() > returnWindow) {
    res.status(400);
    throw new Error('Return window has expired');
  }

  let refundAmount = 0;
  items.forEach(item => {
    refundAmount += item.price * item.quantity;
  });

  const returnRequest = await ReturnRequest.create({
    order: orderId,
    user: req.user._id,
    items,
    requestType,
    reason,
    description,
    refundAmount,
  });

  order.orderStatus = 'Return Requested';
  await order.save();

  res.status(201).json(returnRequest);
});

// @desc    Get user return requests
// @route   GET /api/returns/my-returns
// @access  Private
export const getMyReturns = asyncHandler(async (req, res) => {
  const returns = await ReturnRequest.find({ user: req.user._id })
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 });
  res.json(returns);
});

// @desc    Get return request by ID
// @route   GET /api/returns/:id
// @access  Private
export const getReturnById = asyncHandler(async (req, res) => {
  const returnReq = await ReturnRequest.findById(req.params.id).populate('order');

  if (returnReq && (returnReq.user.toString() === req.user._id.toString() || req.user.role === 'admin')) {
    res.json(returnReq);
  } else {
    res.status(404);
    throw new Error('Return request not found or unauthorized');
  }
});

// @desc    Cancel return request
// @route   PATCH /api/returns/:id/cancel
// @access  Private
export const cancelReturnRequest = asyncHandler(async (req, res) => {
  const returnReq = await ReturnRequest.findById(req.params.id);

  if (returnReq && returnReq.user.toString() === req.user._id.toString()) {
    if (returnReq.status !== 'Requested') {
      res.status(400);
      throw new Error(`Cannot cancel return request in ${returnReq.status} status`);
    }

    returnReq.status = 'Cancelled';
    await returnReq.save();

    // Revert order status back to Delivered
    const order = await Order.findById(returnReq.order);
    if(order) {
      order.orderStatus = 'Delivered';
      await order.save();
    }

    res.json(returnReq);
  } else {
    res.status(404);
    throw new Error('Return request not found');
  }
});
