import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  LogOut,
  Menu,
  X,
  Bell,
  Package,
  MapPin,
  Shield,
  Tag,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout, api } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef(null);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;

  // Fetch unread notifications
  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(({ data }) => {
          const unread = data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // Debounced search suggestions
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?keyword=${encodeURIComponent(search)}&limit=5`);
        setSuggestions(data.products || []);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggestions(false);
      navigate(`/products?keyword=${encodeURIComponent(search)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const categories = [
    { name: 'All Products', path: '/products' },
    { name: 'Electronics', path: '/products?category=electronics' },
    { name: 'Fashion', path: '/products?category=fashion' },
    { name: 'Footwear', path: '/products?category=footwear' },
    { name: 'Home & Kitchen', path: '/products?category=home-kitchen' },
    { name: 'Sports', path: '/products?category=sports' },
    { name: 'Beauty', path: '/products?category=beauty' },
    { name: 'Offers', path: '/offers', highlight: true },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-gray-900">
                Easy<span className="text-primary-600">Cart</span>
              </span>
            </Link>
          </div>

          {/* Search Bar with Autocomplete Suggestions */}
          <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for products, brands, and categories..."
                  value={search}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Product Suggestions
                </div>
                {suggestions.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={p.images?.[0] || 'https://via.placeholder.com/40'}
                      alt={p.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.brandName} • ₹{p.variants?.[0]?.discountPrice || p.variants?.[0]?.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Navigation Icons */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-600 hover:text-rose-600 rounded-full hover:bg-gray-50 transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications Icon (logged in) */}
            {user && (
              <Link
                to="/customer/notifications"
                className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-50 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 text-gray-600 hover:text-primary-600 rounded-full hover:bg-gray-50 transition-colors relative flex items-center gap-1.5"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-colors text-xs font-semibold">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <div className="absolute right-0 w-52 mt-1.5 py-1.5 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    {user.role === 'admin' && (
                      <span className="inline-block px-1.5 py-0.5 mt-1 text-[10px] font-bold bg-primary-100 text-primary-700 rounded">
                        Admin Account
                      </span>
                    )}
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/customer/dashboard"
                    className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    My Profile & Settings
                  </Link>

                  <Link
                    to="/customer/orders"
                    className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                    My Orders
                  </Link>

                  <Link
                    to="/customer/addresses"
                    className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    Saved Addresses
                  </Link>

                  <Link
                    to="/customer/returns"
                    className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 text-gray-400" />
                    Returns & Refunds
                  </Link>

                  <Link
                    to="/customer/notifications"
                    className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Bell className="w-4 h-4 mr-2 text-gray-400" />
                    Notifications
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  state={{ admin: true }}
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors border border-emerald-200"
                  title="Admin Access Code Sign In"
                >
                  <Shield className="w-3 h-3" /> Admin
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-bold text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="hidden md:block bg-gray-50/80 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-10 overflow-x-auto hide-scrollbar text-xs font-semibold">
            {categories.map((c) => (
              <Link
                key={c.name}
                to={c.path}
                className={`whitespace-nowrap transition-colors ${
                  c.highlight
                    ? 'text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {c.highlight && <Tag className="w-3 h-3" />}
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </form>

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-1">
              Shop Categories
            </p>
            {categories.map((c) => (
              <Link
                key={c.name}
                to={c.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-2.5 py-1.5 text-xs font-semibold rounded-lg ${
                  c.highlight ? 'text-rose-600 bg-rose-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-1">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-2.5 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 rounded-lg"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/customer/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  My Orders
                </Link>
                <Link
                  to="/customer/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold border border-gray-200 rounded-lg text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold bg-primary-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
