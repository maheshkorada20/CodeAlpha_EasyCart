# EasyCart – Modern Role-Based E-Commerce Platform

EasyCart is a full-featured, production-ready MERN stack e-commerce web application inspired by Myntra and Flipkart, built with modern React, Tailwind CSS, Lucide icons, Express, and MongoDB.

---

## 🏗 Project Architecture

### 📂 Backend Folder Structure (`server/`)
```
server/
├── config/
│   ├── db.js                 # MongoDB connection logic (Atlas + local fallback)
│   └── env.js                # Environment configuration loader
├── controllers/
│   ├── auth/                 # Authentication & profile logic
│   │   └── authController.js
│   ├── customer/             # Customer-facing controllers
│   │   ├── cartController.js
│   │   ├── wishlistController.js
│   │   ├── orderController.js
│   │   ├── addressController.js
│   │   ├── returnController.js
│   │   ├── reviewController.js
│   │   ├── notificationController.js
│   │   └── userController.js
│   └── admin/                # Admin management controllers
│       ├── adminController.js
│       ├── productController.js
│       ├── categoryController.js
│       ├── couponController.js
│       └── bannerController.js
├── models/                   # Mongoose Schemas
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Order.js
│   ├── Address.js
│   ├── Coupon.js
│   ├── Banner.js
│   ├── Review.js
│   ├── ReturnRequest.js
│   └── Notification.js
├── routes/
│   ├── auth/                 # Auth routes (/api/auth)
│   ├── customer/             # Customer routes (/api/cart, /api/orders, etc.)
│   └── admin/                # Admin routes (/api/admin, /api/products, etc.)
├── middleware/
│   ├── authMiddleware.js     # JWT token verification
│   ├── roleMiddleware.js     # Role verification (admin/customer)
│   └── errorMiddleware.js    # Centralized error handler
└── server.js                 # Express app initialization
```

### 💻 Frontend Folder Structure (`client/`)
```
client/src/
├── components/
│   ├── common/               # Modal, ProtectedRoute, AdminRoute, etc.
│   ├── layout/               # Navbar, Footer, AdminLayout
│   └── products/             # ProductCard, ProductFilters, etc.
├── context/
│   ├── AuthContext.jsx       # Authentication & user state
│   ├── CartContext.jsx       # Shopping cart state
│   └── WishlistContext.jsx   # Wishlist state
└── pages/
    ├── auth/                 # Login, Register, ForgotPassword, ResetPassword
    ├── customer/             # Dashboard, Orders, Addresses, Returns, Notifications
    ├── admin/                # Dashboard, Products, Orders, Categories, Coupons, Banners, Returns, Reviews, Users, Inventory
    └── public/               # Home, Products, ProductDetails, Cart, Offers, FAQ, 404
```

---

## 🚀 Running the Application

### 1. Server Setup
```bash
cd server
npm install
npm run dev
```
Server runs on: **http://localhost:5000**

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```
Client runs on: **http://localhost:5173**

---

## 🔑 Demo Credentials

- **Admin Account**:
  - Email: `admin@easycart.com`
  - Password: `password123`
  - Admin Access Code (for new admin registration): `EASYCART_ADMIN_2026`

- **Customer Account**:
  - Email: `john@example.com`
  - Password: `password123`

---

## 🇮🇳 Currency & Localization
All prices throughout the application are displayed in **Indian Rupee (₹)**.
