import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Cart from '../../models/Cart.js';
import Coupon from '../../models/Coupon.js';
import Address from '../../models/Address.js';
import Notification from '../../models/Notification.js';
import asyncHandler from '../../utils/asyncHandler.js';

// Helper to generate order number
const generateOrderNumber = () => {
  return 'ORD' + Math.floor(100000 + Math.random() * 900000) + Date.now().toString().slice(-4);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    paymentMethod,
    couponCode,
  } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error('Shipping address is required');
  }

  let finalShippingAddress = shippingAddress;
  if (typeof shippingAddress === 'string') {
    const addressDoc = await Address.findById(shippingAddress);
    if (addressDoc) {
      finalShippingAddress = {
        fullName: addressDoc.fullName,
        phone: addressDoc.phone,
        addressLine: addressDoc.addressLine,
        city: addressDoc.city,
        state: addressDoc.state,
        postalCode: addressDoc.postalCode,
        country: addressDoc.country || 'India',
        landmark: addressDoc.landmark,
      };
    }
  }

  // Get user cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const orderItems = [];
  let subtotal = 0;

  // Validate stock and calculate prices
  for (const item of cart.items) {
    const product = item.product;
    const variant = product.variants.find(v => v.variantId === item.variantId);

    if (!variant || !variant.isActive) {
      res.status(400);
      throw new Error(`Variant for ${product.name} is no longer available`);
    }

    if (variant.stock < item.quantity) {
      res.status(400);
      throw new Error(`Not enough stock for ${product.name} - ${variant.size || variant.color}`);
    }

    const price = variant.discountPrice || variant.price;
    const total = price * item.quantity;
    subtotal += total;

    orderItems.push({
      product: product._id,
      variantId: variant.variantId,
      sku: variant.sku,
      name: product.name,
      image: (variant.images && variant.images[0]) || (product.images && product.images[0]) || '',
      size: variant.size,
      color: variant.color,
      quantity: item.quantity,
      price: variant.price,
      discountPrice: variant.discountPrice,
      total,
    });
  }

  // Handle Coupon
  let couponDiscount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (coupon) {
      if (subtotal >= coupon.minimumOrderValue) {
        if (coupon.discountType === 'percentage') {
          couponDiscount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && couponDiscount > coupon.maximumDiscount) {
            couponDiscount = coupon.maximumDiscount;
          }
        } else {
          couponDiscount = coupon.discountValue;
        }
        
        // Update coupon usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  const deliveryCharge = subtotal > 500 ? 0 : 50;
  const tax = 0;
  const totalAmount = subtotal - couponDiscount + deliveryCharge + tax;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    shippingAddress: finalShippingAddress,
    paymentMethod,
    subtotal,
    couponDiscount,
    deliveryCharge,
    tax,
    totalAmount,
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : 'Pending',
    orderStatus: 'Confirmed'
  });

  // Decrease product stock and increase sold count
  for (const item of orderItems) {
    await Product.findOneAndUpdate(
      { _id: item.product, 'variants.variantId': item.variantId },
      { 
        $inc: { 
          'variants.$.stock': -item.quantity,
          soldCount: item.quantity
        } 
      }
    );
  }

  // Clear user cart
  cart.items = [];
  await cart.save();

  // Create order notification (safely)
  try {
    await Notification.create({
      user: req.user._id,
      title: 'Order Confirmed!',
      message: `Your order #${order.orderNumber} for ₹${order.totalAmount} has been placed successfully.`,
      type: 'order_confirmed',
      relatedOrder: order._id,
    });
  } catch (notifErr) {
    console.error('Order notification creation notice:', notifErr.message);
  }

  res.status(201).json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order && (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin')) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }
});

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Returned', 'Refunded'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Cannot cancel order in ${order.orderStatus} status`);
  }

  order.orderStatus = 'Cancelled';
  order.cancellationReason = cancellationReason;
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.findOneAndUpdate(
      { _id: item.product, 'variants.variantId': item.variantId },
      { 
        $inc: { 
          'variants.$.stock': item.quantity,
          soldCount: -item.quantity
        } 
      }
    );
  }

  // Create cancellation notification
  await Notification.create({
    user: order.user,
    title: `Order #${order.orderNumber} Cancelled`,
    message: `Your order #${order.orderNumber} has been successfully cancelled.`,
    type: 'order_cancelled',
    relatedOrder: order._id,
  });

  res.json(order);
});

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).select('orderStatus orderNumber createdAt deliveredAt user');
  
  if (order && (order.user.toString() === req.user._id.toString() || req.user.role === 'admin')) {
    const timeline = [
      { status: 'Pending', date: order.createdAt, completed: true },
      { status: 'Confirmed', date: order.createdAt, completed: ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) },
      { status: 'Shipped', date: null, completed: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) },
      { status: 'Out for Delivery', date: null, completed: ['Out for Delivery', 'Delivered'].includes(order.orderStatus) },
      { status: 'Delivered', date: order.deliveredAt, completed: order.orderStatus === 'Delivered' }
    ];
    
    res.json({ orderNumber: order.orderNumber, currentStatus: order.orderStatus, timeline });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
