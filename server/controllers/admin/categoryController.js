import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import asyncHandler from '../../utils/asyncHandler.js';

const DEFAULT_CATEGORIES = [
  {
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Trendy t-shirts, shirts, denim jeans, and ethnic wear.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    isActive: true,
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'Running shoes, casual sneakers, formal loafers, and sandals.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    isActive: true,
  },
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, audio, smart watches, and home appliances.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    isActive: true,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Cookware, bath essentials, home decor, and smart lighting.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
    isActive: true,
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports',
    description: 'Gym equipment, yoga gear, training accessories, and bottles.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    isActive: true,
  },
  {
    name: 'Beauty & Grooming',
    slug: 'beauty',
    description: 'Skin care serums, organic hair oils, perfumes, and cosmetics.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    isActive: true,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Bags, sunglasses, premium leather wallets, and jewelry.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    isActive: true,
  },
];

// @desc    Get all categories (auto-seeds defaults if empty)
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  let categories = await Category.find({}).sort({ name: 1 });

  // Auto-seed if database has no categories yet
  if (!categories || categories.length === 0) {
    try {
      console.log('Categories list empty. Auto-seeding default categories...');
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
      console.log(`✅ Successfully seeded ${categories.length} default categories!`);
    } catch (err) {
      console.error('Error auto-seeding categories:', err.message);
      // Fallback: return defaults with temporary ids if DB error
      return res.json(DEFAULT_CATEGORIES.map((c, i) => ({ ...c, _id: `temp-cat-${i}` })));
    }
  }

  res.json(categories);
});

// @desc    Seed or reset default categories
// @route   POST /api/categories/seed
// @access  Private/Admin
export const seedCategories = asyncHandler(async (req, res) => {
  for (const cat of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: cat },
      { upsert: true, new: true }
    );
  }
  const allCategories = await Category.find({}).sort({ name: 1 });
  res.json({ message: 'Default categories verified/seeded successfully', categories: allCategories });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  let { name, slug, description, image, isActive } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  if (!slug) {
    slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const categoryExists = await Category.findOne({ $or: [{ slug }, { name }] });
  if (categoryExists) {
    res.status(400);
    throw new Error(`Category "${name}" or slug "${slug}" already exists`);
  }

  const category = await Category.create({
    name,
    slug,
    description: description || `${name} collection and products`,
    image: image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, isActive } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    category.isActive = isActive !== undefined ? isActive : category.isActive;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    const productsInCategory = await Product.countDocuments({ category: req.params.id });
    if (productsInCategory > 0) {
      res.status(400);
      throw new Error(`Cannot delete category because it contains ${productsInCategory} products. Reassign or delete the products first.`);
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category removed' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});
