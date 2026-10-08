import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const base = 'c:/Users/MAHESH/OneDrive/Desktop/CodeAlpha_Tasks/EasyCart/easycart/server';

// Root-level stub controllers (pure re-exports of sub-dir files — not used by server.js)
const stubControllers = [
  'controllers/authController.js',
  'controllers/adminController.js',
  'controllers/addressController.js',
  'controllers/bannerController.js',
  'controllers/cartController.js',
  'controllers/categoryController.js',
  'controllers/couponController.js',
  'controllers/notificationController.js',
  'controllers/orderController.js',
  'controllers/productController.js',
  'controllers/returnController.js',
  'controllers/reviewController.js',
  'controllers/userController.js',
  'controllers/wishlistController.js',
];

// Root-level stub routes (pure re-exports of sub-dir files — not used by server.js)
const stubRoutes = [
  'routes/authRoutes.js',
  'routes/adminRoutes.js',
  'routes/addressRoutes.js',
  'routes/bannerRoutes.js',
  'routes/cartRoutes.js',
  'routes/categoryRoutes.js',
  'routes/couponRoutes.js',
  'routes/notificationRoutes.js',
  'routes/orderRoutes.js',
  'routes/productRoutes.js',
  'routes/returnRoutes.js',
  'routes/reviewRoutes.js',
  'routes/uploadRoutes.js',
  'routes/userRoutes.js',
  'routes/wishlistRoutes.js',
];

const allStubs = [...stubControllers, ...stubRoutes];

for (const rel of allStubs) {
  const fullPath = path.join(base, rel).replace(/\//g, '\\');
  if (existsSync(fullPath)) {
    try {
      await unlink(fullPath);
      console.log(`✅ Deleted: ${rel}`);
    } catch (e) {
      console.log(`❌ Failed to delete: ${rel} — ${e.message}`);
    }
  } else {
    console.log(`⚠️  Not found (already gone): ${rel}`);
  }
}

console.log('\n🧹 Cleanup complete!');
