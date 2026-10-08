import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Wishlist = () => {
  const { wishlist, loading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your saved wishlist..." />;
  }

  const items = wishlist?.products || [];

  const handleMoveToCart = async (product) => {
    const defaultVariant = product.variants?.[0];
    if (defaultVariant) {
      await addToCart(product._id, defaultVariant.variantId, 1);
      await toggleWishlist(product._id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            My Wishlist
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        {items.length > 0 && (
          <Link
            to="/products"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center"
          >
            Continue Shopping <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you like and want to buy later. Click the heart icon on any product to save it here."
          actionText="Browse Trending Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => {
            const defaultVar = product.variants?.[0] || {};
            const price = defaultVar.discountPrice || defaultVar.price || 0;
            const originalPrice = defaultVar.price || price;
            const isOutOfStock = defaultVar.stock <= 0;

            return (
              <div
                key={product._id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
                  <Link to={`/products/${product._id}`} className="absolute inset-0">
                    <img
                      src={defaultVar.images?.[0] || product.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow text-gray-400 hover:text-rose-600 transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold uppercase rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">
                    {product.brandName || 'EasyCart'}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="text-xs font-bold text-gray-900 line-clamp-1 hover:text-primary-600 mt-1 mb-2"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-auto pt-2 flex items-baseline space-x-2">
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    {originalPrice > price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={isOutOfStock}
                    className="w-full mt-3 py-2 px-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
