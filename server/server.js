import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/auth/authRoutes.js';
import productRoutes from './routes/admin/productRoutes.js';
import categoryRoutes from './routes/admin/categoryRoutes.js';
import cartRoutes from './routes/customer/cartRoutes.js';
import wishlistRoutes from './routes/customer/wishlistRoutes.js';
import couponRoutes from './routes/admin/couponRoutes.js';
import addressRoutes from './routes/customer/addressRoutes.js';
import orderRoutes from './routes/customer/orderRoutes.js';
import reviewRoutes from './routes/customer/reviewRoutes.js';
import returnRoutes from './routes/customer/returnRoutes.js';
import notificationRoutes from './routes/customer/notificationRoutes.js';
import adminRoutes from './routes/admin/adminRoutes.js';
import uploadRoutes from './routes/admin/uploadRoutes.js';
import bannerRoutes from './routes/admin/bannerRoutes.js';
import userRoutes from './routes/customer/userRoutes.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import { populateSeedData } from './utils/seedData.js';
import path from 'path';

const app = express();
// Connected to database easycart1 - reloading configuration

// Connect to Database
connectDB().then(async () => {
  try {
    const [productCount, categoryCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
    ]);
    if (productCount < 30 || categoryCount < 7) {
      console.log(`Database catalog has ${productCount} products and ${categoryCount} categories. Populating complete real demo seed data...`);
      const res = await populateSeedData();
      console.log(`Demo seed data populated successfully: ${res.productsCount} products across ${res.categoriesCount} categories!`);
    }
  } catch (err) {
    console.log('Auto-seed check notice:', err.message);
  }
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        ENV.CLIENT_URL,
        ENV.CLIENT_URL ? ENV.CLIENT_URL.replace(/\/$/, '') : null,
        'http://localhost:5173',
        'http://localhost:3000',
      ].filter(Boolean);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        ENV.NODE_ENV !== 'production'
      ) {
        return callback(null, origin);
      }
      return callback(null, origin);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (ENV.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Make uploads folder static
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


// Health check route
app.get('/health', (req, res) => {
  const state = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = state[Product.db?.readyState || 0];
  res.json({
    status: 'ok',
    database: dbState,
    nodeEnv: ENV.NODE_ENV,
    port: ENV.PORT
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('EasyCart API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
});
