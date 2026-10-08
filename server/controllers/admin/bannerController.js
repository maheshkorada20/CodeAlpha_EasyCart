import Banner from '../../models/Banner.js';
import asyncHandler from '../../utils/asyncHandler.js';

// @desc    Get active banners for home/storefront
// @route   GET /api/banners
// @access  Public
export const getActiveBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const banners = await Banner.find({
    isActive: true,
    $or: [
      { startDate: null, endDate: null },
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: null },
      { startDate: null, endDate: { $gte: now } }
    ]
  }).sort({ displayOrder: 1, createdAt: -1 });

  res.json(banners);
});

// @desc    Get all banners (Admin)
// @route   GET /api/banners/all
// @access  Private/Admin
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
  res.json(banners);
});

// @desc    Get banner by ID
// @route   GET /api/banners/:id
// @access  Private/Admin
export const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }
  res.json(banner);
});

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
  const { title, description, image, targetUrl, displayOrder, startDate, endDate, isActive } = req.body;

  if (!title || !image) {
    res.status(400);
    throw new Error('Please provide title and image URL for banner');
  }

  const banner = await Banner.create({
    title,
    description: description || '',
    image,
    targetUrl: targetUrl || '/products',
    displayOrder: displayOrder || 0,
    startDate: startDate || null,
    endDate: endDate || null,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(banner);
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  banner.title = req.body.title || banner.title;
  banner.description = req.body.description !== undefined ? req.body.description : banner.description;
  banner.image = req.body.image || banner.image;
  banner.targetUrl = req.body.targetUrl !== undefined ? req.body.targetUrl : banner.targetUrl;
  banner.displayOrder = req.body.displayOrder !== undefined ? req.body.displayOrder : banner.displayOrder;
  banner.startDate = req.body.startDate !== undefined ? req.body.startDate : banner.startDate;
  banner.endDate = req.body.endDate !== undefined ? req.body.endDate : banner.endDate;
  banner.isActive = req.body.isActive !== undefined ? req.body.isActive : banner.isActive;

  const updatedBanner = await banner.save();
  res.json(updatedBanner);
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  await banner.deleteOne();
  res.json({ message: 'Banner removed successfully' });
});
