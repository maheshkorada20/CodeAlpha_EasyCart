import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import {
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  CheckCircle2,
  Share2,
  ArrowLeft,
  ChevronRight,
  MessageSquarePlus,
} from 'lucide-react';
import VariantSelector from '../../components/products/VariantSelector';
import RatingStars from '../../components/common/RatingStars';
import ProductCard from '../../components/products/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Cart status
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        const defaultVar = data.variants?.[0] || null;
        setSelectedVariant(defaultVar);
        setSelectedImage(defaultVar?.images?.[0] || data.images?.[0] || '');

        // Fetch related products
        if (data.category) {
          const catId = typeof data.category === 'object' ? data.category._id : data.category;
          api.get(`/products?category=${catId}&limit=5`)
            .then((res) => {
              setRelatedProducts((res.data.products || []).filter((p) => p._id !== data._id));
            })
            .catch(() => {});
        }

        // Fetch reviews
        api.get(`/products/${id}/reviews`)
          .then((res) => setReviews(res.data || []))
          .catch(() => {});
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // When variant changes, update selected image if variant has its own image
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    if (variant?.images?.length > 0) {
      setSelectedImage(variant.images[0]);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    if (!selectedVariant || selectedVariant.stock <= 0) return;

    setAddingToCart(true);
    const res = await addToCart(product._id, selectedVariant.variantId, quantity);
    setAddingToCart(false);

    if (res.success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } else {
      alert(res.message || 'Could not add item to cart');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on EasyCart!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');

    try {
      const { data } = await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviews([data, ...reviews]);
      setReviewModalOpen(false);
      setReviewComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading product specifications..." />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The product you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/products" className="px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-sm">
          Browse All Products
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.discountPrice || selectedVariant?.price || 0;
  const originalPrice = selectedVariant?.price || currentPrice;
  const hasDiscount = selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const isWishlisted = isInWishlist(product._id);

  // Combine images
  const allImages = [
    ...(selectedVariant?.images || []),
    ...(product.images || []),
  ].filter((img, idx, arr) => arr.indexOf(img) === idx);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to={`/products?category=${typeof product.category === 'object' ? product.category._id : product.category}`}
              className="hover:text-primary-600"
            >
              {typeof product.category === 'object' ? product.category.name : 'Category'}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={selectedImage || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-black uppercase tracking-wider bg-rose-600 text-white rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product._id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-700 hover:text-rose-600 active:scale-90 transition-all"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? 'border-primary-600 ring-2 ring-primary-100' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Meta & Purchase Options */}
        <div className="flex flex-col space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary-600">
                {product.brandName || 'EasyCart'}
              </span>
              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                title="Share Product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Ratings & Sold Count */}
          <div className="flex items-center space-x-3 py-2 border-y border-gray-100">
            <RatingStars rating={product.rating} numReviews={product.numReviews} size="md" />
            <span className="text-xs text-gray-300">|</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {product.soldCount || 100}+ Orders Placed
            </span>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-black text-gray-900">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <>
                <span className="text-base text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] text-gray-400">Inclusive of all applicable taxes.</span>

          {/* Variant Selector (Colors, Sizes, Live Stock) */}
          <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
            <VariantSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={handleVariantChange}
            />
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-xs font-bold hover:bg-gray-50 text-gray-600"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(selectedVariant?.stock || 5, quantity + 1))}
                  className="px-3 py-2 text-xs font-bold hover:bg-gray-50 text-gray-600"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariant || selectedVariant.stock <= 0}
                className="flex-1 inline-flex items-center justify-center py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {selectedVariant?.stock <= 0
                  ? 'Out of Stock'
                  : addingToCart
                  ? 'Adding...'
                  : addedSuccess
                  ? 'Added to Cart ✓'
                  : 'Add to Cart'}
              </button>
            </div>

            {addedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-fade-in">
                <span>Item added to your cart successfully!</span>
                <Link to="/cart" className="underline hover:text-emerald-900 ml-2">
                  View Cart →
                </Link>
              </div>
            )}
          </div>

          {/* Pincode & Delivery Checker */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Delivery Options
            </h4>
            <div className="flex max-w-sm">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeChecked(false);
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-l-xl text-xs outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={() => setPincodeChecked(pincode.length === 6)}
                className="px-4 py-2 bg-gray-900 text-white font-bold text-xs rounded-r-xl hover:bg-black"
              >
                Check
              </button>
            </div>
            {pincodeChecked && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Fast Express delivery available by Tomorrow for pincode {pincode}!
              </p>
            )}
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <Truck className="w-4 h-4 text-primary-600 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-gray-700">Free Delivery</p>
              <p className="text-[9px] text-gray-400">On ₹500+</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-gray-700">7-Day Return</p>
              <p className="text-[9px] text-gray-400">Doorstep pickup</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-gray-700">100% Genuine</p>
              <p className="text-[9px] text-gray-400">Direct from brand</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Description */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-16 space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-3">
            Product Specifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {product.specifications?.map((spec, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-gray-500 font-medium">{spec.key}</span>
                <span className="text-gray-900 font-bold">{spec.value}</span>
              </div>
            ))}
            <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Brand</span>
              <span className="text-gray-900 font-bold">{product.brandName || 'EasyCart'}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-500 font-medium">Category</span>
              <span className="text-gray-900 font-bold">
                {typeof product.category === 'object' ? product.category.name : 'General'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-2">
            Detailed Description
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      </div>

      {/* Verified Reviews Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-16">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
          <div>
            <h3 className="text-lg font-black text-gray-900">Ratings & Customer Reviews</h3>
            <div className="flex items-center space-x-2 mt-1">
              <RatingStars rating={product.rating} numReviews={product.numReviews} size="md" />
            </div>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors flex items-center"
          >
            <MessageSquarePlus className="w-4 h-4 mr-1.5" />
            Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">
            No customer reviews yet. Be the first to review this verified purchase!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 bg-gray-50 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{rev.user?.name || 'Customer'}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 mr-0.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <RatingStars rating={rev.rating} showCount={false} />
                </div>
                <p className="text-gray-600 leading-relaxed">{rev.comment}</p>
                <span className="text-[10px] text-gray-400 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900">Similar Products You Might Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Write a Customer Review">
        {reviewError && (
          <div className="p-3 mb-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {reviewError}
          </div>
        )}
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Your Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setReviewRating(s)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${s <= reviewRating ? 'fill-amber-400' : 'text-gray-200'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Detailed Review</label>
            <textarea
              rows={4}
              required
              placeholder="What did you like or dislike about this product? How is the quality and fit?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 resize-none text-xs"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              {reviewSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetails;
