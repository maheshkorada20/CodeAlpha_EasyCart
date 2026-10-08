import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  variantId: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  size: String,
  color: String,
  price: {
    type: Number,
    required: true,
  },
  discountPrice: Number,
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const specificationSchema = new mongoose.Schema({
  name: String,
  value: String,
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
    },
    shortDescription: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    images: [String],
    variants: [variantSchema],
    specifications: [specificationSchema],
    tags: [String],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-5);
  }
  next();
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brandName: 'text', tags: 'text' });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
