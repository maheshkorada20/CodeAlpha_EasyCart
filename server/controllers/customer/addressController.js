import Address from '../../models/Address.js';
import asyncHandler from '../../utils/asyncHandler.js';

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.json(addresses);
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
export const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, addressLine, city, state, postalCode, country, landmark, addressType, isDefault } = req.body;

  const addressCount = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = isDefault || addressCount === 0;

  if (shouldBeDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({
    user: req.user._id,
    fullName,
    phone,
    addressLine,
    city,
    state,
    postalCode,
    country,
    landmark,
    addressType,
    isDefault: shouldBeDefault,
  });

  res.status(201).json(address);
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address && address.user.toString() === req.user._id.toString()) {
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { isDefault: false });
    }

    Object.assign(address, req.body);
    const updatedAddress = await address.save();
    res.json(updatedAddress);
  } else {
    res.status(404);
    throw new Error('Address not found or unauthorized');
  }
});

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address && address.user.toString() === req.user._id.toString()) {
    await Address.deleteOne({ _id: address._id });
    
    if (address.isDefault) {
      const remainingAddress = await Address.findOne({ user: req.user._id });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }
    
    res.json({ message: 'Address removed' });
  } else {
    res.status(404);
    throw new Error('Address not found or unauthorized');
  }
});

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (address && address.user.toString() === req.user._id.toString()) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    res.json(address);
  } else {
    res.status(404);
    throw new Error('Address not found or unauthorized');
  }
});
