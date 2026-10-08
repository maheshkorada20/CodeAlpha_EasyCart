import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  ArrowRight,
  Truck,
  RotateCcw,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyOrders = () => {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/orders/my-orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [api]);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading your orders..." />;
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'processing') return ['Pending', 'Confirmed', 'Processing', 'Packed'].includes(o.orderStatus);
    if (statusFilter === 'shipped') return ['Shipped', 'Out for Delivery'].includes(o.orderStatus);
    if (statusFilter === 'delivered') return o.orderStatus === 'Delivered';
    if (statusFilter === 'cancelled') return o.orderStatus === 'Cancelled';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-600" />
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Check the status of current orders, request returns, and view invoices
          </p>
        </div>
        <Link
          to="/customer/returns"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
          Manage Returns & Refunds
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: `All Orders (${orders.length})` },
          { key: 'processing', label: 'Processing' },
          { key: 'shipped', label: 'Shipped' },
          { key: 'delivered', label: 'Delivered' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="You haven't placed any orders in this category yet."
          actionText="Start Shopping"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.orderStatus === 'Delivered';
            const isCancelled = order.orderStatus === 'Cancelled';

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header Bar */}
                <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Order #</span>
                      <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Placed On</span>
                      <span className="font-semibold text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Total Amount</span>
                      <span className="font-extrabold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-primary-100 text-primary-800'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <Link
                      to={`/customer/orders/${order._id}`}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-lg font-bold text-xs inline-flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      Details
                    </Link>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-6 divide-y divide-gray-50">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {item.size ? `Size: ${item.size} ` : ''}
                            {item.color ? `• ${item.color} ` : ''}
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{item.total?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
