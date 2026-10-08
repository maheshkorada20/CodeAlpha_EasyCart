import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Package, Home, Truck, ShieldCheck, Gift, Star, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/* ─── Confetti particle config ─── */
const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8','#f783ac','#74c0fc','#a9e34b','#ff6b6b'];
const SHAPES = ['circle','square','ribbon'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function generateParticles(count = 120) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: randomBetween(0, 100),           // % from left
    delay: randomBetween(0, 1.8),        // s
    duration: randomBetween(2.5, 5),     // s
    size: randomBetween(6, 14),          // px
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    swing: randomBetween(-180, 180),     // rotate deg
    driftX: randomBetween(-120, 120),    // px horizontal drift
  }));
}

/* ─── Balloon component ─── */
function Balloon({ color, left, delay, size }) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${left}%`,
        bottom: '-120px',
        animation: `balloonRise ${randomBetween(4, 7).toFixed(1)}s ease-in ${delay}s forwards`,
        fontSize: `${size}px`,
        zIndex: 5,
      }}
    >
      <div style={{ color, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))' }}>🎈</div>
    </div>
  );
}

/* ─── Confetti particle ─── */
function ConfettiParticle({ x, delay, duration, size, color, shape, swing, driftX }) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'ribbon' ? '2px' : '2px';
  const width = shape === 'ribbon' ? size * 0.4 : size;
  const height = shape === 'ribbon' ? size * 2 : size;

  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        left: `${x}%`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: color,
        borderRadius,
        animation: `confettiFall ${duration}s ease-in ${delay}s both`,
        '--drift': `${driftX}px`,
        '--swing': `${swing}deg`,
        zIndex: 10,
      }}
    />
  );
}

const BALLOONS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  left: randomBetween(2, 98),
  delay: randomBetween(0, 2.5),
  size: randomBetween(28, 48),
}));

const OrderSuccess = () => {
  const { id } = useParams();
  const { api } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [particles] = useState(() => generateParticles(140));
  const [showContent, setShowContent] = useState(false);
  const [celebrationActive, setCelebrationActive] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Stagger content reveal
    const t = setTimeout(() => setShowContent(true), 400);
    // Stop confetti after 6s
    const t2 = setTimeout(() => setCelebrationActive(false), 7000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Confirming your order…" />;
  }

  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--drift)) rotate(var(--swing)); opacity: 0; }
        }
        @keyframes balloonRise {
          0%   { transform: translateY(0) rotate(-4deg); opacity: 0.95; }
          50%  { transform: translateY(-55vh) rotate(4deg); opacity: 0.85; }
          100% { transform: translateY(-130vh) rotate(-2deg); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0) rotate(-12deg); opacity: 0; }
          70%  { transform: scale(1.12) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes shimmer {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.6; }
        }
        @keyframes checkPop {
          0%   { transform: scale(0); }
          60%  { transform: scale(1.25); }
          80%  { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        @keyframes ringPulse {
          0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
          100% { box-shadow: 0 0 0 28px rgba(16,185,129,0); }
        }
        .pop-in   { animation: popIn   0.55s cubic-bezier(.34,1.56,.64,1) both; }
        .slide-up { animation: slideUp 0.5s ease both; }
      `}</style>

      {/* ── Full-screen celebration canvas ── */}
      {celebrationActive && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
          {particles.map(p => <ConfettiParticle key={p.id} {...p} />)}
          {BALLOONS.map(b => <Balloon key={b.id} {...b} />)}
        </div>
      )}

      {/* ── Page Content ── */}
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex flex-col items-center justify-start pt-16 pb-20 px-4">

        {/* ── Big success icon ── */}
        <div className={`relative ${showContent ? 'pop-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          {/* pulsing ring */}
          <div className="absolute inset-0 rounded-full"
            style={{ animation: 'ringPulse 1.2s ease-out 0.6s 3' }} />
          <div className="w-28 h-28 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl border-4 border-white">
            <CheckCircle2 className="w-14 h-14 text-white" style={{ animation: 'checkPop 0.6s cubic-bezier(.34,1.56,.64,1) 0.3s both' }} />
          </div>

          {/* decorative stars */}
          {['top-0 -right-2','top-0 -left-3','-bottom-1 -right-3','-bottom-1 -left-2'].map((pos, i) => (
            <Star key={i} className={`absolute ${pos} w-5 h-5 text-amber-400 fill-amber-400`}
              style={{ animation: `shimmer 1.4s ease ${i * 0.2}s infinite` }} />
          ))}
        </div>

        {/* ── Headline ── */}
        <div className={`text-center mt-7 ${showContent ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.25s' }}>
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-emerald-200">
            <Gift className="w-3.5 h-3.5" /> Order Placed Successfully
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Yay! 🎉 Thank You for Shopping<br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              with EasyCart!
            </span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 max-w-sm mx-auto">
            Your order is confirmed and being prepared with care. We'll notify you every step of the way.
          </p>
        </div>

        {/* ── Celebration banner strip ── */}
        <div className={`w-full max-w-lg mt-6 ${showContent ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.38s' }}>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0891b2 100%)' }}>
            <div className="px-6 py-4 text-white text-center">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">What happens next?</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  { icon: '📦', label: 'Order\nConfirmed', sub: 'Just now' },
                  { icon: '🚚', label: 'Out for\nDelivery', sub: deliveryDate },
                  { icon: '🏠', label: 'Delivered\nAt Door', sub: '+1 day' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <span className="text-2xl mb-1">{s.icon}</span>
                    <span className="text-[10px] font-bold whitespace-pre-line text-center leading-tight">{s.label}</span>
                    <span className="text-[10px] opacity-70 mt-0.5">{s.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Order summary card ── */}
        {order && (
          <div className={`w-full max-w-lg mt-5 ${showContent ? 'slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              {/* card header */}
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Order Reference</p>
                  <p className="font-mono font-black text-gray-900 text-sm">#{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Paid</p>
                  <p className="font-extrabold text-emerald-600 text-xl">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* delivery info */}
              <div className="px-5 py-4 space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Truck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Estimated Delivery: {deliveryDate}</p>
                    <p className="text-gray-500 text-[11px]">
                      To {order.shippingAddress?.fullName}{order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Payment: {order.paymentMethod}</p>
                    <p className="text-gray-500 text-[11px] capitalize">{order.paymentStatus}</p>
                  </div>
                </div>

                {/* order items mini list */}
                {order.orderItems?.length > 0 && (
                  <div className="border-t border-gray-50 pt-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Items in Your Order</p>
                    {order.orderItems.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-[11px]">{item.name}</p>
                          <p className="text-gray-400 text-[10px]">Qty: {item.quantity} · ₹{item.price?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                    {order.orderItems.length > 3 && (
                      <p className="text-[10px] text-gray-400 mt-1">+{order.orderItems.length - 3} more item(s)</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CTA Buttons ── */}
        <div className={`flex flex-col sm:flex-row gap-3 w-full max-w-lg mt-6 ${showContent ? 'slide-up' : 'opacity-0'}`}
          style={{ animationDelay: '0.62s' }}>
          <Link
            to={`/customer/orders/${id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}
          >
            <Package className="w-4 h-4" />
            Track My Order
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
          <Link
            to="/products"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        {/* ── Fun tagline ── */}
        <p className={`mt-8 text-xs text-gray-400 text-center ${showContent ? 'slide-up' : 'opacity-0'}`}
          style={{ animationDelay: '0.75s' }}>
          🛍️ Happy Shopping! · EasyCart — Fast Delivery, Easy Returns
        </p>
      </div>
    </>
  );
};

export default OrderSuccess;
