import User from '../models/User.js';
import Address from '../models/Address.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import { categoriesData, getProductsData } from '../scripts/seedProductsData.js';

export const populateSeedData = async () => {
  await User.deleteMany();
  await Address.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await Banner.deleteMany();
  await Coupon.deleteMany();
  await Order.deleteMany();
  await Review.deleteMany();
  await Notification.deleteMany();

  // Admin User
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@easycart.com',
    password: 'password123',
    role: 'admin',
    phone: '9876543200',
  });

  // Customer Users
  const customer1 = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '9876543210',
  });

  const customer2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    phone: '9876543220',
  });

  // Customer Address
  const address1 = await Address.create({
    user: customer1._id,
    fullName: 'John Doe',
    phone: '9876543210',
    addressLine: 'Flat 402, Sunshine Heights, Linking Road',
    landmark: 'Near Bandra Police Station',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    country: 'India',
    addressType: 'Home',
    isDefault: true,
  });

  // Insert all 7 categories
  const categories = await Category.insertMany(categoriesData);

  // Map category slug to ObjectId
  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // Insert 35 products (5 per category across all 7 categories)
  const productsData = getProductsData(catMap);
  const products = await Product.insertMany(productsData);

  // Marketing Banners
  await Banner.insertMany([
    {
      title: 'Mega Season Sale',
      description: 'Up to 60% OFF on Top Trending Fashion, Footwear & Accessories!',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80',
      targetUrl: '/category/fashion',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Next-Gen Electronics',
      description: 'Premium wireless headphones, 4K Smart TVs & smart gadgets.',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=80',
      targetUrl: '/category/electronics',
      displayOrder: 2,
      isActive: true,
    },
    {
      title: 'Home & Living Refresh',
      description: 'Elevate your kitchen and living space with luxury cookware.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1400&q=80',
      targetUrl: '/category/home-kitchen',
      displayOrder: 3,
      isActive: true,
    },
    {
      title: 'Sports & Wellness Drive',
      description: 'High-density yoga mats, adjustable weights & sports gear.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1400&q=80',
      targetUrl: '/category/sports',
      displayOrder: 4,
      isActive: true,
    },
  ]);

  // Promotional Coupons
  await Coupon.insertMany([
    {
      code: 'WELCOME10',
      description: '10% discount on orders above ₹499',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderValue: 499,
      maximumDiscount: 300,
      usageLimit: 1000,
      perUserLimit: 1,
      expiryDate: new Date('2028-12-31'),
      isActive: true,
    },
    {
      code: 'EASY500',
      description: 'Flat ₹500 discount on orders above ₹2,499',
      discountType: 'fixed',
      discountValue: 500,
      minimumOrderValue: 2499,
      usageLimit: 500,
      perUserLimit: 1,
      expiryDate: new Date('2028-12-31'),
      isActive: true,
    },
    {
      code: 'FESTIVE25',
      description: 'Special 25% discount on orders above ₹1,499',
      discountType: 'percentage',
      discountValue: 25,
      minimumOrderValue: 1499,
      maximumDiscount: 750,
      usageLimit: 300,
      perUserLimit: 1,
      expiryDate: new Date('2028-12-31'),
      isActive: true,
    },
  ]);

  // Sample Review
  await Review.create({
    product: products[0]._id,
    user: customer1._id,
    rating: 5,
    comment: 'Exceptional sound clarity and the noise cancellation is just magical for flights. Highly recommended!',
    isVerifiedPurchase: true,
    isApproved: true,
  });

  // Sample Delivered Order
  const order1 = await Order.create({
    orderNumber: 'ORD9283718291',
    user: customer1._id,
    items: [
      {
        product: products[0]._id,
        variantId: products[0].variants[0].variantId,
        sku: products[0].variants[0].sku,
        name: products[0].name,
        image: products[0].variants[0].images[0],
        color: products[0].variants[0].color,
        quantity: 1,
        price: products[0].variants[0].price,
        discountPrice: products[0].variants[0].discountPrice,
        total: products[0].variants[0].discountPrice,
      },
    ],
    shippingAddress: {
      fullName: address1.fullName,
      phone: address1.phone,
      addressLine: address1.addressLine,
      city: address1.city,
      state: address1.state,
      postalCode: address1.postalCode,
      country: address1.country,
    },
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    subtotal: 3499,
    productDiscount: 1500,
    couponDiscount: 0,
    deliveryCharge: 0,
    tax: 0,
    totalAmount: 3499,
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  // Customer Notifications
  await Notification.create({
    user: customer1._id,
    title: 'Welcome to EasyCart!',
    message: 'Explore trending products and use coupon code WELCOME10 for 10% off your first order.',
    type: 'promo',
  });

  await Notification.create({
    user: customer1._id,
    title: 'Order Delivered!',
    message: 'Your order #ORD9283718291 has been delivered. Enjoy your purchase!',
    type: 'order_delivered',
    relatedOrder: order1._id,
  });

  return {
    usersCount: 3,
    categoriesCount: categories.length,
    productsCount: products.length,
    bannersCount: 4,
    couponsCount: 3,
  };
};
