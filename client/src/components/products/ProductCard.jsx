import { Link } from 'react-router-dom';
import { Heart, Star, Flame, Sparkles, Zap } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const defaultVariant = product.variants?.[0] || {};
  const currentPrice = defaultVariant.discountPrice || defaultVariant.price || 0;
  const originalPrice = defaultVariant.price || currentPrice;
  const hasDiscount = defaultVariant.discountPrice && defaultVariant.discountPrice < defaultVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const mainImage = defaultVariant.images?.[0] || product.images?.[0] || 'https://via.placeholder.com/400';
  const isWishlisted = isInWishlist(product._id);

  const colors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];
  const sizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))];

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative w-full pt-[100%] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Link to={`/products/${product._id}`} className="absolute inset-0">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            style={{ transform: 'scale(1)' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            loading="lazy"
          />
        </Link>

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          aria-label="Wishlist"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white text-gray-400 hover:text-rose-500 transition-all active:scale-90 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isWishlisted ? 'text-rose-500 fill-rose-500 scale-110' : ''
            }`}
          />
        </button>

        {/* Badges — stacked top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', color: '#fff' }}>
              <Flame className="w-3 h-3" />
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff' }}>
              <Sparkles className="w-3 h-3" />
              New
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
              <Zap className="w-3 h-3" />
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Rating Floating Tag */}
        {product.rating > 0 && (
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-md flex items-center space-x-1 text-xs font-bold text-gray-800 border border-amber-100">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal text-[10px]">({product.numReviews})</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1 truncate">
          {product.brandName || 'EasyCart'}
        </div>

        <Link
          to={`/products/${product._id}`}
          className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 leading-snug"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Variant hints */}
        {(colors.length > 0 || sizes.length > 0) && (
          <div className="text-[11px] text-gray-400 mb-3 flex items-center gap-1.5 flex-wrap">
            {colors.length > 0 && <span className="bg-gray-50 px-1.5 py-0.5 rounded">{colors.length} {colors.length === 1 ? 'Color' : 'Colors'}</span>}
            {sizes.length > 0 && <span className="bg-gray-50 px-1.5 py-0.5 rounded">{sizes.slice(0, 3).join(' · ')}{sizes.length > 3 ? ' +more' : ''}</span>}
          </div>
        )}

        {/* Price Row */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
          <span className="text-lg font-black text-gray-900 leading-none">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="ml-auto text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
