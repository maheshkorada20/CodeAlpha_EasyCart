import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    addressLine: {
      type: String,
      required: [true, 'Please provide address line'],
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide postal code'],
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      default: 'India',
    },
    landmark: {
      type: String,
    },
    addressType: {
      type: String,
      enum: ['Home', 'Work', 'Other', 'home', 'work', 'other'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;
