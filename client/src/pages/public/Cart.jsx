import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import {
  Trash2,
  Bookmark,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  Percent,
  Sparkles,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, saveForLater, moveToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { user, api } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your shopping cart..." />;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your cart</h2>
        <p className="text-xs text-gray-500 mb-6">
          Log in to synchronize your items across devices and access saved addresses.
        </p>
        <Link
          to="/login"
          state={{ from: { pathname: '/cart' } }}
          className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-primary-700"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const savedItems = cart?.savedForLaterItems || [];

  const getVariant = (product, variantId) => {
    if (!product || !product.variants) return null;
    return product.variants.find((v) => v.variantId === variantId) || product.variants[0];
  };

  // Calculations
  let subtotal = 0;
  let originalTotal = 0;

  items.forEach((item) => {
    const variant = getVariant(item.product, item.variantId);
    if (variant) {
      const price = variant.discountPrice || variant.price || 0;
      const orig = variant.price || price;
      subtotal += price * item.quantity;
      originalTotal += orig * item.quantity;
    }
  });

  const productSavings = originalTotal - subtotal;
  const couponSavings = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 50;
  const finalTotal = Math.max(0, subtotal - couponSavings + deliveryCharge);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode,
        orderValue: subtotal,
      });
      setAppliedCoupon(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        appliedCouponCode: appliedCoupon ? appliedCoupon.code : null,
      },
    });
  };

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your bag is empty"
        description="Explore our best-selling collections and find what you love."
        actionText="Shop Now"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-8">
        Shopping Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const variant = getVariant(item.product, item.variantId);
            if (!variant || !item.product) return null;

            const price = variant.discountPrice || variant.price || 0;
            const originalPrice = variant.price || price;
            const isOutOfStock = variant.stock <= 0;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={variant.images?.[0] || item.product.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">
                      {item.product.brandName || 'EasyCart'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                      <Link to={`/products/${item.product._id}`} className="hover:text-primary-600">
                        {item.product.name}
                      </Link>
                    </h3>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      {variant.color && <span>Color: <strong>{variant.color}</strong></span>}
                      {variant.size && <span>• Size: <strong>{variant.size}</strong></span>}
                    </div>
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-sm font-extrabold text-gray-900">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {originalPrice > price && (
                        <span className="text-[11px] text-gray-400 line-through">
                          ₹{(originalPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions & Quantity */}
                <div className="flex items-center justify-between sm:justify-end sm:space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= variant.stock}
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => saveForLater(item._id)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Save for Later"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="pt-8">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-primary-600" />
                Saved for Later ({savedItems.length})
              </h3>
              <div className="space-y-3">
                {savedItems.map((item) => {
                  const variant = getVariant(item.product, item.variantId);
                  if (!variant) return null;
                  const price = variant.discountPrice || variant.price || 0;

                  return (
                    <div
                      key={item._id}
                      className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={variant.images?.[0] || item.product?.images?.[0] || 'https://via.placeholder.com/100'}
                          alt={item.product?.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{item.product?.name}</h4>
                          <span className="text-xs font-extrabold text-gray-700">₹{price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => moveToCart(item._id)}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-colors"
                      >
                        Move to Bag
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Coupon Input */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary-600" />
              Apply Coupon Code
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-emerald-800 uppercase">
                    {appliedCoupon.code} Applied
                  </span>
                  <p className="text-[11px] text-emerald-700">
                    You saved ₹{appliedCoupon.discountAmount}!
                  </p>
                </div>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, EASY500"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-l-xl text-xs uppercase font-mono outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon}
                    className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-r-xl hover:bg-black transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{couponError}</p>
                )}
                <div className="flex justify-between items-center text-[11px] text-primary-600 pt-1">
                  <Link to="/offers" className="hover:underline font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    View all active coupons
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              Price Details ({items.length} {items.length === 1 ? 'Item' : 'Items'})
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total MRP:</span>
                <span className="font-semibold text-gray-900">₹{originalTotal.toLocaleString('en-IN')}</span>
              </div>

              {productSavings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Product Discount:</span>
                  <span className="font-semibold">-₹{productSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount ({appliedCoupon.code}):</span>
                  <span className="font-semibold">-₹{couponSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-gray-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Total Amount:</span>
              <span className="text-xl font-black text-gray-900">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {productSavings + couponSavings > 0 && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl text-center">
                🎉 You will save ₹{(productSavings + couponSavings).toLocaleString('en-IN')} on this order!
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              disabled={items.length === 0}
              className="w-full py-3.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Secure Guarantee */}
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center space-x-3 text-gray-500 text-xs">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Safe and Secure Payments. 100% Authentic Products guaranteed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
