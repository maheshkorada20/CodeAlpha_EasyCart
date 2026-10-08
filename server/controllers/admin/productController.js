import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { populateSeedData } from '../../utils/seedData.js';

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const currentCount = await Product.countDocuments();
  if (currentCount < 20) {
    try {
      console.log(`Current product count is ${currentCount}. Populating full catalog across all 7 categories...`);
      await populateSeedData();
      console.log('Full catalog successfully populated!');
    } catch (seedErr) {
      console.error('Catalog auto-seed error:', seedErr);
    }
  }

  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword;
  
  const query = { isActive: true };

  // Search by name, brand, or tags
  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { brandName: { $regex: keyword, $options: 'i' } },
      { tags: { $in: [new RegExp(keyword, 'i')] } }
    ];
  }

  // Filters
  if (req.query.category) {
    const catInput = req.query.category;
    if (catInput.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = catInput;
    } else {
      // Find category by slug or name
      const foundCat = await Category.findOne({
        $or: [{ slug: catInput }, { name: { $regex: new RegExp(`^${catInput}$`, 'i') } }]
      });
      if (foundCat) {
        query.category = foundCat._id;
      } else {
        // Return empty result if category doesn't exist
        return res.json({
          products: [],
          page: 1,
          pages: 1,
          totalCount: 0
        });
      }
    }
  }
  if (req.query.brand) query.brandName = req.query.brand;
  if (req.query.rating) query.rating = { $gte: Number(req.query.rating) };
  if (req.query.isFeatured) query.isFeatured = req.query.isFeatured === 'true';
  if (req.query.isNewArrival) query.isNewArrival = req.query.isNewArrival === 'true';
  if (req.query.isBestSeller) query.isBestSeller = req.query.isBestSeller === 'true';

  // Variant Filters (Size, Color, Price range, Stock)
  if (req.query.size || req.query.color || req.query.minPrice || req.query.maxPrice || req.query.inStock) {
    query.variants = { $elemMatch: {} };
    
    if (req.query.size) query.variants.$elemMatch.size = { $regex: req.query.size, $options: 'i' };
    if (req.query.color) query.variants.$elemMatch.color = { $regex: req.query.color, $options: 'i' };
    if (req.query.inStock === 'true') query.variants.$elemMatch.stock = { $gt: 0 };
    
    if (req.query.minPrice || req.query.maxPrice) {
      query.variants.$elemMatch.price = {};
      if (req.query.minPrice) query.variants.$elemMatch.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.variants.$elemMatch.price.$lte = Number(req.query.maxPrice);
    }
  }

  // Sorting
  let sort = {};
  switch (req.query.sort) {
    case 'price_asc':
      sort = { 'variants.0.price': 1 };
      break;
    case 'price_desc':
      sort = { 'variants.0.price': -1 };
      break;
    case 'rating':
      sort = { rating: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'discount':
      sort = { 'variants.0.discountPrice': 1 };
      break;
    default:
      sort = { isFeatured: -1, createdAt: -1 };
  }

  try {
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize) || 1,
      totalCount: count
    });
  } catch (err) {
    console.error('Error in getProducts:', err);
    return res.status(500).json({ 
      error: err.message, 
      code: err.code,
      codeName: err.codeName,
      name: err.name 
    });
  }
});

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
  
  let product;
  if (isObjectId) {
    product = await Product.findById(req.params.id).populate('category', 'name slug');
  } else {
    product = await Product.findOne({ slug: req.params.id }).populate('category', 'name slug');
  }

  if (product && product.isActive) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// Helper: generate a URL-friendly slug from a string
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // Auto-generate slug if not provided
  if (!data.slug && data.name) {
    let baseSlug = slugify(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    data.slug = slug;
  }

  // Auto-generate variantId and sku for each variant if missing
  if (Array.isArray(data.variants)) {
    data.variants = data.variants.map((v, i) => ({
      ...v,
      variantId: v.variantId || `var-${Date.now()}-${i}`,
      sku: v.sku || `SKU-${Date.now().toString(36).toUpperCase()}-${i}`,
    }));
  }

  const product = new Product(data);
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const data = { ...req.body };

    // If name changed and no slug provided, regenerate slug
    if (data.name && !data.slug && data.name !== product.name) {
      let baseSlug = slugify(data.name);
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: product._id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      data.slug = slug;
    }

    // Ensure each variant has variantId and sku
    if (Array.isArray(data.variants)) {
      data.variants = data.variants.map((v, i) => ({
        ...v,
        variantId: v.variantId || `var-${Date.now()}-${i}`,
        sku: v.sku || `SKU-${Date.now().toString(36).toUpperCase()}-${i}`,
      }));
    }

    Object.assign(product, data);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update product status (activate/deactivate)
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
export const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.isActive = req.body.isActive;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
