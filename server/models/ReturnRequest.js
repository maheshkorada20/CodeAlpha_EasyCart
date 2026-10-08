import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        variantId: String,
        quantity: Number,
        price: Number,
      },
    ],
    requestType: {
      type: String,
      enum: ['Return', 'Exchange'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        'Requested',
        'Approved',
        'Rejected',
        'Pickup Scheduled',
        'Picked Up',
        'Received',
        'Refund Initiated',
        'Completed',
        'Cancelled',
      ],
      default: 'Requested',
    },
    adminNotes: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
