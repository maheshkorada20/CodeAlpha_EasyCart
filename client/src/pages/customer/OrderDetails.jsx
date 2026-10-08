import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  MapPin,
  CreditCard,
  Printer,
  RotateCcw,
  XCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
} from 'lucide-react';
import OrderTimeline from '../../components/orders/OrderTimeline';
import InvoiceModal from '../../components/orders/InvoiceModal';
import ReturnModal from '../../components/orders/ReturnModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found cheaper elsewhere');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await api.patch(`/orders/${id}/cancel`, { cancellationReason: cancelReason });
      setCancelModalOpen(false);
      await fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading order information..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">{error || 'This order does not exist or you do not have permission to view it.'}</p>
        <Link to="/customer/orders" className="px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancellable = ['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus);
  const isReturnEligible = order.orderStatus === 'Delivered';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
      {/* Top Bar with Back and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <Link
            to="/customer/orders"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-primary-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Orders
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                order.orderStatus === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : order.orderStatus === 'Cancelled'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-primary-50 text-primary-700 border border-primary-200'
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setInvoiceOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            Print Invoice
          </button>

          {isCancellable && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Cancel Order
            </button>
          )}

          {isReturnEligible && (
            <button
              onClick={() => setReturnOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Return / Exchange
            </button>
          )}
        </div>
      </div>

      {/* Graphical Order Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Order Status Tracker
        </h3>
        <OrderTimeline
          status={order.orderStatus}
          createdAt={order.createdAt}
          deliveredAt={order.deliveredAt}
        />
        {order.cancellationReason && (
          <p className="text-xs text-rose-600 font-medium mt-3 bg-rose-50 p-3 rounded-xl">
            Cancellation Reason: {order.cancellationReason}
          </p>
        )}
      </div>

      {/* Order Items Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Ordered Items ({order.items?.length})
        </h3>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={item.image || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-100 flex-shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                    {item.size ? `Size: ${item.size} ` : ''}
                    {item.color ? `• Color: ${item.color} ` : ''}
                    {item.sku ? `(${item.sku})` : ''}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Qty: <strong className="text-gray-700">{item.quantity}</strong> × ₹{(item.discountPrice || item.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <span className="text-sm font-black text-gray-900">
                ₹{item.total.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Address & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-2 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-primary-600" />
            Shipping Address
          </h3>
          <p className="font-bold text-gray-900 text-sm">{order.shippingAddress?.fullName}</p>
          <p className="text-gray-600 leading-relaxed">
            {order.shippingAddress?.addressLine}
            {order.shippingAddress?.landmark ? `, ${order.shippingAddress.landmark}` : ''}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
            Country: {order.shippingAddress?.country || 'India'}<br />
            Phone: <strong className="text-gray-900">{order.shippingAddress?.phone}</strong>
          </p>
        </div>

        {/* Payment & Price Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 pb-2 border-b border-gray-100">
            <CreditCard className="w-4 h-4 text-primary-600" />
            Payment & Total
          </h3>

          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method:</span>
            <span className="font-bold text-gray-900">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Payment Status:</span>
            <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {order.paymentStatus}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Coupon Savings:</span>
                <span className="font-semibold">-₹{order.couponDiscount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge:</span>
              <span className="font-semibold text-gray-900">
                {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Grand Total:</span>
              <span className="text-primary-600">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        order={order}
      />

      {/* Return Modal */}
      <ReturnModal
        isOpen={returnOpen}
        onClose={() => setReturnOpen(false)}
        order={order}
        onSuccess={fetchOrder}
      />

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-gray-900">Cancel Order #{order.orderNumber}?</h3>
            <p className="text-gray-500">
              Please choose a reason for cancelling this order. Once cancelled, this action cannot be reversed.
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-primary-500 text-xs"
            >
              <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
              <option value="Order placed by mistake">Order placed by mistake</option>
              <option value="Delivery time is too long">Delivery time is too long</option>
              <option value="Need to change shipping address">Need to change shipping address</option>
              <option value="Changed mind">Changed mind</option>
            </select>

            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 font-semibold text-gray-600"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
