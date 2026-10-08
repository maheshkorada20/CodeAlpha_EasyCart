import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tag, Copy, Check, Sparkles, Percent, Gift } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Offers = () => {
  const { api } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    api.get('/coupons/active')
      .then(({ data }) => setCoupons(data))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-indigo-800 to-purple-900 rounded-3xl p-8 sm:p-12 text-white mb-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-4 text-purple-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exclusive Deals & Coupons</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Save Big On Every Order with EasyCart Offers
          </h1>
          <p className="text-sm text-purple-100/80 leading-relaxed">
            Apply verified discount codes at checkout to unlock instant price reductions on fashion, electronics, lifestyle products, and more.
          </p>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Tag className="w-5 h-5 text-primary-600" />
          <span>Active Promo Coupons</span>
        </h2>

        {loading ? (
          <LoadingSpinner text="Fetching active offers..." />
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No active coupons at this moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <div
                key={coupon._id}
                className="relative bg-white rounded-2xl border-2 border-dashed border-primary-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <Percent className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Verified
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mb-1">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% Instant OFF`
                      : `Flat ₹${coupon.discountValue} Instant OFF`}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    {coupon.description || `Valid on orders above ₹${coupon.minimumOrderValue}`}
                  </p>

                  <div className="text-[11px] text-gray-400 space-y-1 mb-6">
                    <p>• Min Order: ₹{coupon.minimumOrderValue}</p>
                    {coupon.maximumDiscount && <p>• Max Discount: ₹{coupon.maximumDiscount}</p>}
                    <p>• Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="font-mono font-bold text-sm text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg tracking-wider">
                    {coupon.code}
                  </div>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50">
          <Gift className="w-8 h-8 text-primary-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">100% Genuine Brands</h4>
            <p className="text-[11px] text-gray-500">Every item is sourced directly from certified creators.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50">
          <Sparkles className="w-8 h-8 text-primary-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">Free Express Delivery</h4>
            <p className="text-[11px] text-gray-500">Enjoy zero delivery fee on all orders over ₹500.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50">
          <Tag className="w-8 h-8 text-primary-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-gray-900">7-Day Easy Returns</h4>
            <p className="text-[11px] text-gray-500">Doorstep pickups with instant refund initiation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
