import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Loader2, CreditCard, Banknote, MapPin, Plus } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const { cart, clearCart, loading: cartLoading } = useCart();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/addresses');
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr._id);
        } else if (data.length > 0) {
          setSelectedAddress(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching addresses');
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [api]);

  if (cartLoading || loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const getVariant = (product, variantId) => {
    if (!product || !Array.isArray(product.variants)) return null;
    return product.variants.find(v => v.variantId === variantId || v._id?.toString() === variantId?.toString()) || product.variants[0] || null;
  };

  const calculateSubtotal = () => {
    let total = 0;
    items.forEach(item => {
      const variant = getVariant(item.product, item.variantId);
      if (variant) {
        const price = variant.discountPrice || variant.price || 0;
        total += price * item.quantity;
      } else if (item.price) {
        total += item.price * item.quantity;
      }
    });
    return total;
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal - couponDiscount + shipping;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    try {
      setCouponError('');
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderValue: subtotal });
      setCouponDiscount(data.discountAmount);
    } catch (err) {
      setCouponDiscount(0);
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a shipping address');
      return;
    }

    try {
      setPlacingOrder(true);
      setError(null);
      
      const { data } = await api.post('/orders', {
        shippingAddress: selectedAddress,
        paymentMethod,
        couponCode: couponDiscount > 0 ? couponCode : undefined
      });
      
      // Clear cart locally since backend already cleared it
      await clearCart();
      
      navigate(`/order-success/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-600" /> Shipping Address
            </h2>
            
            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">You don't have any saved addresses.</p>
                <button onClick={() => navigate('/customer/addresses')} className="btn-primary inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" /> Add New Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <label 
                    key={addr._id} 
                    className={`border rounded-lg p-4 cursor-pointer flex items-start transition-colors ${
                      selectedAddress === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="address" 
                      value={addr._id} 
                      checked={selectedAddress === addr._id}
                      onChange={() => setSelectedAddress(addr._id)}
                      className="mt-1 mr-3 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{addr.fullName}</span>
                        {addr.addressType && (
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{addr.addressType}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{addr.addressLine}</p>
                      <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-sm text-gray-600">{addr.country}</p>
                      <p className="text-sm text-gray-600 mt-2 font-medium">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary-600" /> Payment Method
            </h2>
            
            <div className="space-y-4">
              <label className={`border rounded-lg p-4 cursor-pointer flex items-center transition-colors ${
                paymentMethod === 'Cash on Delivery' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
              }`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Cash on Delivery" 
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <Banknote className="w-6 h-6 text-gray-400 mr-3" />
                <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
              </label>

              <label className={`border rounded-lg p-4 cursor-pointer flex items-center transition-colors ${
                paymentMethod === 'Card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 opacity-50'
              }`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Card" 
                  disabled
                  className="mr-3 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <CreditCard className="w-6 h-6 text-gray-400 mr-3" />
                <div>
                  <span className="font-medium text-gray-900">Credit / Debit Card</span>
                  <p className="text-xs text-red-500 mt-1">Currently unavailable for maintenance</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 lg:mt-0 lg:col-span-4 space-y-6">
          {/* Coupon */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Have a coupon code?</h3>
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="btn-secondary whitespace-nowrap">Apply</button>
            </form>
            {couponError && <p className="text-sm text-red-500 mt-2">{couponError}</p>}
            {couponDiscount > 0 && <p className="text-sm text-green-600 mt-2">🎉 Coupon applied! Save ₹{couponDiscount.toFixed(2)}</p>}
          </div>

          {/* Totals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-4">Order Summary</h2>
            
            <div className="max-h-64 overflow-y-auto mb-6 hide-scrollbar space-y-4">
              {items.map(item => {
                const variant = getVariant(item.product, item.variantId);
                const price = variant ? (variant.discountPrice || variant.price) : 0;
                
                return (
                  <div key={item._id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2">{item.quantity}x</span>
                      <span className="text-gray-600 line-clamp-1 max-w-[150px]">{item.product?.name || item.name || 'Product'}</span>
                    </div>
                    <span className="font-medium text-gray-900">₹{(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <dl className="space-y-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</dd>
              </div>
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <dt>Discount</dt>
                  <dd className="font-medium">-₹{couponDiscount.toFixed(2)}</dd>
                </div>
              )}
              
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="font-medium text-gray-900">{shipping === 0 ? 'FREE Delivery' : `₹${shipping.toFixed(2)}`}</dd>
              </div>
              
              <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900">
                <dt>Total</dt>
                <dd>₹{total.toFixed(2)}</dd>
              </div>
            </dl>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddress}
              className="w-full mt-6 btn-primary py-3 flex justify-center items-center"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...
                </>
              ) : (
                `Place Order • ₹${total.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
