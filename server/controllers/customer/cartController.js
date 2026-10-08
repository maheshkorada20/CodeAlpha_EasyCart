import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import asyncHandler from '../../utils/asyncHandler.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name slug images category brandName variants')
    .populate('savedForLaterItems.product', 'name slug images category brandName variants');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], savedForLaterItems: [] });
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found or inactive');
  }

  const variant = product.variants.find(v => v.variantId === variantId);
  if (!variant || !variant.isActive) {
    res.status(404);
    throw new Error('Variant not found or inactive');
  }

  if (variant.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${variant.stock} items in stock`);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [], savedForLaterItems: [] });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId && item.variantId === variantId
  );

  if (itemIndex > -1) {
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    if (newQuantity > variant.stock) {
      res.status(400);
      throw new Error(`Cannot add more. Only ${variant.stock} items in stock`);
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, variantId, quantity });
  }

  await cart.save();
  await cart.populate('items.product', 'name slug images category brandName variants');
  
  res.status(201).json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  const product = await Product.findById(item.product);
  const variant = product.variants.find(v => v.variantId === item.variantId);

  if (quantity > variant.stock) {
    res.status(400);
    throw new Error(`Only ${variant.stock} items in stock`);
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name slug images category brandName variants');

  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  
  if (cart) {
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } else {
    res.status(404);
    throw new Error('Cart not found');
  }
});

// @desc    Save item for later
// @route   POST /api/cart/save-for-later
// @access  Private
export const saveForLater = asyncHandler(async (req, res) => {
  const { itemId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex > -1) {
    const [item] = cart.items.splice(itemIndex, 1);
    cart.savedForLaterItems.push({
      product: item.product,
      variantId: item.variantId,
      quantity: 1
    });
    await cart.save();
    await cart.populate('items.product', 'name slug images category brandName variants');
    await cart.populate('savedForLaterItems.product', 'name slug images category brandName variants');
    res.json(cart);
  } else {
    res.status(404);
    throw new Error('Item not found in cart');
  }
});

// @desc    Move item to cart from saved
// @route   POST /api/cart/move-to-cart
// @access  Private
export const moveToCart = asyncHandler(async (req, res) => {
  const { itemId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.savedForLaterItems.findIndex(item => item._id.toString() === itemId);
  if (itemIndex > -1) {
    const [item] = cart.savedForLaterItems.splice(itemIndex, 1);
    
    const existingCartItem = cart.items.find(
      i => i.product.toString() === item.product.toString() && i.variantId === item.variantId
    );
    
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      cart.items.push({
        product: item.product,
        variantId: item.variantId,
        quantity: 1
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name slug images category brandName variants');
    await cart.populate('savedForLaterItems.product', 'name slug images category brandName variants');
    res.json(cart);
  } else {
    res.status(404);
    throw new Error('Item not found in saved items');
  }
});
