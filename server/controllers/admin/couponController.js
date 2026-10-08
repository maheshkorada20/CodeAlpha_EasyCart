import Coupon from '../../models/Coupon.js';
import asyncHandler from '../../utils/asyncHandler.js';

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiryDate: { $gte: new Date() },
  });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid or expired coupon');
  }

  // Check minimum order value
  if (orderValue < coupon.minimumOrderValue) {
    res.status(400);
    throw new Error(`Minimum order value of ${coupon.minimumOrderValue} required`);
  }

  // Check overall usage limit
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit reached');
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
      discountAmount = coupon.maximumDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({
    _id: coupon._id,
    code: coupon.code,
    discountAmount,
    description: coupon.description,
  });
});

// @desc    Create coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minimumOrderValue,
    maximumDiscount,
    usageLimit,
    perUserLimit,
    expiryDate,
    isActive,
  } = req.body;

  const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minimumOrderValue,
    maximumDiscount,
    usageLimit,
    perUserLimit,
    expiryDate,
    isActive,
  });

  res.status(201).json(coupon);
});

// @desc    Get all active coupons (for users/public)
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    expiryDate: { $gte: new Date() },
  }).select('-usedCount -usageLimit -perUserLimit');
  
  res.json(coupons);
});

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    Object.assign(coupon, req.body);
    if(req.body.code) coupon.code = req.body.code.toUpperCase();
    
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await Coupon.deleteOne({ _id: coupon._id });
    res.json({ message: 'Coupon removed' });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});
