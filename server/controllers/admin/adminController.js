import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Coupon from '../../models/Coupon.js';
import ReturnRequest from '../../models/ReturnRequest.js';
import Review from '../../models/Review.js';
import Notification from '../../models/Notification.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { populateSeedData } from '../../utils/seedData.js';

// @desc    Seed database with demo data
// @route   POST /api/admin/seed
// @access  Private/Admin
export const seedDatabase = asyncHandler(async (req, res) => {
  const result = await populateSeedData();
  res.json({ message: 'Database seeded successfully with demo catalog, users, banners and coupons!', result });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const usersCount = await User.countDocuments({ role: 'customer' });
  const productsCount = await Product.countDocuments();
  const ordersCount = await Order.countDocuments();
  
  const orders = await Order.find();
  const totalRevenue = orders.reduce((acc, order) => {
    if (order.paymentStatus === 'Paid' || order.orderStatus === 'Delivered') {
      return acc + order.totalAmount;
    }
    return acc;
  }, 0);

  const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
  const returnRequests = await ReturnRequest.countDocuments({ status: 'Requested' });

  // Out of stock check across variants
  const products = await Product.find({ isActive: true });
  let outOfStockCount = 0;
  products.forEach(p => {
    p.variants.forEach(v => {
      if (v.stock === 0) outOfStockCount++;
    });
  });

  // Recent 5 orders with user info
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  // Monthly sales data for the past 7 months (for BarChart)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthsMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
    monthsMap[key] = { name: key, sales: 0, orders: 0 };
  }
  orders.forEach(order => {
    const d = new Date(order.createdAt);
    const key = `${monthNames[d.getMonth()]} '${d.getFullYear().toString().slice(-2)}`;
    if (monthsMap[key]) {
      monthsMap[key].orders += 1;
      if (order.paymentStatus === 'Paid' || order.orderStatus === 'Delivered') {
        monthsMap[key].sales += order.totalAmount;
      }
    }
  });
  const salesData = Object.values(monthsMap);

  // Order status distribution for PieChart
  const statusCounts = {};
  orders.forEach(order => {
    statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;
  });
  const orderStatusDistribution = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status],
  }));

  res.json({
    totalRevenue,
    totalOrders: ordersCount,
    totalCustomers: usersCount,
    totalProducts: productsCount,
    pendingOrders,
    outOfStockProducts: outOfStockCount,
    returnRequests,
    recentOrders,
    salesData,
    orderStatusDistribution,
  });
});

// @desc    Get detailed analytics for Recharts
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = asyncHandler(async (req, res) => {
  const orders = await Order.find();

  const monthsMap = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthsMap[key] = { month: key, revenue: 0, orders: 0 };
  }

  orders.forEach(order => {
    const d = new Date(order.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    if (monthsMap[key]) {
      monthsMap[key].orders += 1;
      if (order.paymentStatus === 'Paid' || order.orderStatus === 'Delivered') {
        monthsMap[key].revenue += order.totalAmount;
      }
    }
  });

  const monthlySales = Object.values(monthsMap);

  const statusCounts = {};
  orders.forEach(order => {
    statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;
  });

  const orderStatusDistribution = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status],
  }));

  const categories = await Category.find();
  const catRevenueMap = {};
  categories.forEach(c => {
    catRevenueMap[c.name] = 0;
  });

  const allProducts = await Product.find().populate('category', 'name');
  const productCatMap = {};
  allProducts.forEach(p => {
    productCatMap[p._id.toString()] = p.category?.name || 'Uncategorized';
  });

  orders.forEach(order => {
    order.items.forEach(item => {
      const catName = productCatMap[item.product?.toString()] || 'General';
      catRevenueMap[catName] = (catRevenueMap[catName] || 0) + (item.total || 0);
    });
  });

  const categoryRevenue = Object.keys(catRevenueMap).map(cat => ({
    category: cat,
    revenue: catRevenueMap[cat],
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const topProducts = await Product.find({ isActive: true })
    .sort({ soldCount: -1 })
    .limit(5)
    .select('name brandName soldCount rating numReviews images');

  res.json({
    monthlySales,
    orderStatusDistribution,
    categoryRevenue,
    topProducts,
  });
});

// @desc    Get inventory summary and status
// @route   GET /api/admin/inventory
// @access  Private/Admin
export const getInventory = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  const products = await Product.find().populate('category', 'name');

  const inventoryItems = [];

  products.forEach(prod => {
    prod.variants.forEach(variant => {
      const isOut = variant.stock === 0;
      const isLow = variant.stock > 0 && variant.stock <= 10;

      let include = true;
      if (filter === 'low') include = isLow;
      if (filter === 'out') include = isOut;

      if (include) {
        inventoryItems.push({
          productId: prod._id,
          productName: prod.name,
          category: prod.category?.name || 'Uncategorized',
          brand: prod.brandName,
          variantId: variant.variantId,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          price: variant.price,
          discountPrice: variant.discountPrice,
          stock: variant.stock,
          status: isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock',
        });
      }
    });
  });

  res.json(inventoryItems);
});

// @desc    Update single variant stock
// @route   PATCH /api/admin/inventory/stock
// @access  Private/Admin
export const updateVariantStock = asyncHandler(async (req, res) => {
  const { productId, variantId, stock } = req.body;

  if (!productId || !variantId || stock === undefined) {
    res.status(400);
    throw new Error('Product ID, variant ID and stock count are required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const variant = product.variants.find(v => v.variantId === variantId);
  if (!variant) {
    res.status(404);
    throw new Error('Variant not found');
  }

  variant.stock = Number(stock);
  await product.save();

  res.json({ message: 'Stock updated successfully', variantId, stock: variant.stock });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
      res.status(400);
      throw new Error('Cannot modify another admin account status');
    }
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();
    res.json({ message: 'User status updated', isActive: user.isActive });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all orders with optional filter
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, search } = req.query;
  const query = {};

  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    const oldStatus = order.orderStatus;
    order.orderStatus = req.body.orderStatus;

    if (req.body.orderStatus === 'Delivered') {
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'Cash on Delivery') {
        order.paymentStatus = 'Paid';
      }
    }

    const updatedOrder = await order.save();

    if (oldStatus !== order.orderStatus) {
      await Notification.create({
        user: order.user,
        title: `Order #${order.orderNumber} ${order.orderStatus}`,
        message: `Your order status has been updated to ${order.orderStatus}.`,
        type: order.orderStatus.toLowerCase().includes('deliver') ? 'order_delivered' : 'order_shipped',
        relatedOrder: order._id,
      });
    }

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order payment status
// @route   PATCH /api/admin/orders/:id/payment-status
// @access  Private/Admin
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.paymentStatus = req.body.paymentStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all return requests
// @route   GET /api/admin/returns
// @access  Private/Admin
export const getReturnRequests = asyncHandler(async (req, res) => {
  const returns = await ReturnRequest.find({})
    .populate('user', 'name email phone')
    .populate('order', 'orderNumber totalAmount paymentMethod')
    .sort({ createdAt: -1 });
  res.json(returns);
});

// @desc    Update return request status
// @route   PATCH /api/admin/returns/:id/status
// @access  Private/Admin
export const updateReturnStatus = asyncHandler(async (req, res) => {
  const returnReq = await ReturnRequest.findById(req.params.id).populate('order');

  if (returnReq) {
    const oldStatus = returnReq.status;
    returnReq.status = req.body.status || returnReq.status;
    returnReq.adminNotes = req.body.adminNotes !== undefined ? req.body.adminNotes : returnReq.adminNotes;
    if (req.body.refundAmount !== undefined) {
      returnReq.refundAmount = Number(req.body.refundAmount);
    }

    if (returnReq.status === 'Completed') {
      const order = await Order.findById(returnReq.order._id);
      if (order) {
        order.orderStatus = 'Returned';
        order.paymentStatus = 'Refunded';
        await order.save();
      }
    }

    const updatedReturn = await returnReq.save();

    if (oldStatus !== returnReq.status) {
      await Notification.create({
        user: returnReq.user,
        title: `Return Request ${returnReq.status}`,
        message: `Your return request for Order #${returnReq.order?.orderNumber || ''} is now ${returnReq.status}.`,
        type: returnReq.status === 'Completed' ? 'refund_completed' : 'return_updated',
        relatedOrder: returnReq.order?._id,
      });
    }

    res.json(updatedReturn);
  } else {
    res.status(404);
    throw new Error('Return request not found');
  }
});

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name email')
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc    Moderate review
// @route   PATCH /api/admin/reviews/:id/moderation
// @access  Private/Admin
export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    review.isApproved = req.body.isApproved;
    const updatedReview = await review.save();
    
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const product = await Product.findById(review.product);
    
    if (product) {
      if (allReviews.length > 0) {
        product.numReviews = allReviews.length;
        product.rating = Number((allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length).toFixed(1));
      } else {
        product.numReviews = 0;
        product.rating = 0;
      }
      await product.save();
    }

    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});
