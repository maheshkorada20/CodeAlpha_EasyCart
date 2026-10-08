import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Tag,
  Copy,
  Check,
  Sparkles,
  Flame,
  Zap,
} from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Home = () => {
  const { api } = useAuth();
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, categoriesRes, featuredRes, bestSellersRes, newArrivalsRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/products?isFeatured=true&limit=8'),
          api.get('/products?isBestSeller=true&limit=8'),
          api.get('/products?isNewArrival=true&limit=8'),
        ]);

        setBanners(bannersRes.data || []);
        setCategories(categoriesRes.data || []);
        setFeaturedProducts(featuredRes.data.products || []);
        setBestSellers(bestSellersRes.data.products || []);
        setNewArrivals(newArrivalsRes.data.products || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Banner auto-slide every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading EasyCart experience..." />;
  }

  return (
    <div className="animate-fade-in space-y-12 pb-16">
      {/* Hero Banner Carousel */}
      {banners.length > 0 ? (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[320px] sm:h-[420px] lg:h-[480px]">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-900/50 to-transparent flex items-center">
                  <div className="max-w-xl pl-8 sm:pl-16 pr-6 text-white space-y-4">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Featured Offer</span>
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                      {banner.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed line-clamp-2">
                      {banner.description}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={banner.targetUrl || '/products'}
                        className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-all"
                      >
                        Explore Collection
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md text-gray-800 hover:bg-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/70 backdrop-blur-md text-gray-800 hover:bg-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBanner(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Fallback Hero */
        <div className="relative bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white py-20 px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Everything you need, delivered simply.
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto mb-8 text-sm">
            Discover premium collections across Electronics, Fashion, Footwear, and Lifestyle.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-700"
          >
            Start Shopping Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Customer Trust Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">Free Express Shipping</h4>
              <p className="text-[11px] text-gray-500">On all orders above ₹500</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-gray-500">Doorstep pickups & refunds</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">100% Genuine Brands</h4>
              <p className="text-[11px] text-gray-500">Certified authentic quality</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">24/7 Priority Support</h4>
              <p className="text-[11px] text-gray-500">Dedicated assistance team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Explore</span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Shop by Category</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center"
          >
            View All Categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gray-50 overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={cat.image || 'https://via.placeholder.com/150'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Special Coupon Promo Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-amber-300">
              <Zap className="w-3.5 h-3.5" />
              <span>Limited Time Welcoming Discount</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Get 10% Instant OFF on your first order!
            </h3>
            <p className="text-xs text-primary-100 max-w-lg">
              Use code <strong className="text-white font-mono underline">WELCOME10</strong> at checkout on orders above ₹499.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="font-mono font-bold text-base bg-white text-gray-900 px-4 py-2 rounded-xl shadow-sm tracking-wider">
              WELCOME10
            </div>
            <button
              onClick={() => handleCopyCoupon('WELCOME10')}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center space-x-1.5"
            >
              {copiedCoupon ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCoupon ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Curated</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Featured Products</h2>
              </div>
            </div>
            <Link
              to="/products?isFeatured=true"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center"
            >
              Explore All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Gradient icon block */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest"
                    style={{ background: 'linear-gradient(90deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🔥 Trending Now
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                  Best-Selling Items
                </h2>
                <div className="mt-1.5 h-1 w-16 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
              </div>
            </div>
            <Link
              to="/products?isBestSeller=true"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border-2 border-amber-400 text-amber-600 hover:bg-amber-50 transition-all"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Mobile View All */}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/products?isBestSeller=true"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold border-2 border-amber-400 text-amber-600 hover:bg-amber-50 transition-all">
              View All Bestsellers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">Just In</span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">New Arrivals</h2>
            </div>
            <Link
              to="/products?isNewArrival=true"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-black mb-3">
            Stay Updated with EasyCart
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto mb-6">
            Subscribe to our weekly drop alerts and get secret coupon discounts sent straight to your inbox.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing to EasyCart deals!');
            }}
            className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none focus:ring-2 focus:ring-primary-500 flex-1"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 text-white font-bold text-xs rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
