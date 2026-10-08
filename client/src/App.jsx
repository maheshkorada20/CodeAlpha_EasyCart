import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Pages - Public Storefront
import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetails from './pages/public/ProductDetails';
import Cart from './pages/public/Cart';
import Wishlist from './pages/public/Wishlist';
import Offers from './pages/public/Offers';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQ from './pages/public/FAQ';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsConditions from './pages/public/TermsConditions';
import NotFound from './pages/public/NotFound';

// Pages - Authentication
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Pages - Customer Portal
import Dashboard from './pages/customer/Dashboard';
import Profile from './pages/customer/Profile';
import Addresses from './pages/customer/Addresses';
import Checkout from './pages/customer/Checkout';
import OrderSuccess from './pages/customer/OrderSuccess';
import MyOrders from './pages/customer/MyOrders';
import OrderDetails from './pages/customer/OrderDetails';
import ReturnRequests from './pages/customer/ReturnRequests';
import Notifications from './pages/customer/Notifications';

// Pages - Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageBanners from './pages/admin/ManageBanners';
import ManageReturns from './pages/admin/ManageReturns';
import ManageReviews from './pages/admin/ManageReviews';
import ManageUsers from './pages/admin/ManageUsers';
import ManageInventory from './pages/admin/ManageInventory';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/category/:slug" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/register" element={<Register adminDefault={true} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/customer/dashboard" element={<Dashboard />} />
              <Route path="/customer/profile" element={<Profile />} />
              <Route path="/customer/addresses" element={<Addresses />} />
              <Route path="/customer/orders" element={<MyOrders />} />
              <Route path="/customer/orders/:id" element={<OrderDetails />} />
              <Route path="/customer/returns" element={<ReturnRequests />} />
              <Route path="/customer/notifications" element={<Notifications />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/orders" element={<ManageOrders />} />
              <Route path="/admin/categories" element={<ManageCategories />} />
              <Route path="/admin/coupons" element={<ManageCoupons />} />
              <Route path="/admin/banners" element={<ManageBanners />} />
              <Route path="/admin/returns" element={<ManageReturns />} />
              <Route path="/admin/reviews" element={<ManageReviews />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/inventory" element={<ManageInventory />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
