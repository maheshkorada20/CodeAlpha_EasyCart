import Review from '../../models/Review.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import asyncHandler from '../../utils/asyncHandler.js';

// @desc    Get product reviews
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ 
    product: req.params.productId,
    isApproved: true 
  }).populate('user', 'name avatar').sort({ createdAt: -1 });
  
  res.json(reviews);
});

// @desc    Create new review
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if user already reviewed
  const alreadyReviewed = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  // Check if verified purchase
  const orders = await Order.find({ user: req.user._id, orderStatus: 'Delivered' });
  let isVerifiedPurchase = false;
  let orderId = null;

  for (const order of orders) {
    if (order.items.find(item => item.product.toString() === productId)) {
      isVerifiedPurchase = true;
      orderId = order._id;
      break;
    }
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating: Number(rating),
    comment,
    isVerifiedPurchase,
  });

  // Update product rating
  const allReviews = await Review.find({ product: productId, isApproved: true });
  product.numReviews = allReviews.length;
  product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
  
  await product.save();

  res.status(201).json(review);
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (review && review.user.toString() === req.user._id.toString()) {
    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();

    // Update product rating
    const allReviews = await Review.find({ product: review.product, isApproved: true });
    const product = await Product.findById(review.product);
    product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    await product.save();

    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found or unauthorized');
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review && (review.user.toString() === req.user._id.toString() || req.user.role === 'admin')) {
    const productId = review.product;
    await Review.deleteOne({ _id: review._id });

    // Update product rating
    const allReviews = await Review.find({ product: productId, isApproved: true });
    const product = await Product.findById(productId);
    
    if (allReviews.length > 0) {
      product.numReviews = allReviews.length;
      product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    } else {
      product.numReviews = 0;
      product.rating = 0;
    }
    await product.save();

    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Review not found or unauthorized');
  }
});
