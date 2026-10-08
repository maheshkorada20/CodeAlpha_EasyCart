import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: String,
  size: String,
  color: String,
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: Number,
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      landmark: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash on Delivery', 'Online'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Cash on Delivery'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Processing',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Return Requested',
        'Returned',
        'Refunded',
      ],
      default: 'Pending',
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    productDiscount: {
      type: Number,
      default: 0.0,
    },
    couponDiscount: {
      type: Number,
      default: 0.0,
    },
    deliveryCharge: {
      type: Number,
      default: 0.0,
    },
    tax: {
      type: Number,
      default: 0.0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0.0,
    },
    cancellationReason: String,
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
