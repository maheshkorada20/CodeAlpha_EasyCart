import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Search,
  Eye,
  X,
  MapPin,
  Clock,
  Package,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
} from 'lucide-react';

const STATUS_TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  Processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Packed: 'bg-purple-100 text-purple-800 border-purple-200',
  Shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Out for Delivery': 'bg-teal-100 text-teal-800 border-teal-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  Returned: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ManageOrders = () => {
  const { api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [api]);

  const updateOrderStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === id ? { ...o, orderStatus: newStatus } : o)));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const updatePaymentStatus = async (id, newPaymentStatus) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/orders/${id}/payment-status`, { paymentStatus: newPaymentStatus });
      setOrders(orders.map((o) => (o._id === id ? { ...o, paymentStatus: newPaymentStatus } : o)));
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'All' || o.orderStatus === activeTab;
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout title="Orders Management">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  const allStatuses = [
    'Pending',
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <AdminLayout
      title="Customer Orders & Dispatch Management"
      subtitle="Track customer fulfillment, change dispatch statuses, verify payments, and inspect invoice manifests"
    >
      {/* Top Search & Filter Tab Controls */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Search by order #, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="text-xs font-bold text-gray-500">
            Showing <span className="text-gray-900">{filteredOrders.length}</span> of{' '}
            <span className="text-gray-900">{orders.length}</span> orders
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === 'All' ? orders.length : orders.filter((o) => o.orderStatus === tab).length;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Order #</th>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-left">Date</th>
                <th className="px-6 py-3.5 text-left">Total Value</th>
                <th className="px-6 py-3.5 text-left">Payment</th>
                <th className="px-6 py-3.5 text-left">Fulfillment Status</th>
                <th className="px-6 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                    No orders match the selected status or query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isUpdating = updatingId === order._id;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{order.orderNumber}</div>
                        <div className="text-[11px] text-gray-500">
                          {order.items?.length || 0} items
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {order.user?.name || 'Guest'}
                        </div>
                        <div className="text-[11px] text-gray-400">{order.user?.email || ''}</div>
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 font-black text-gray-900">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="block text-[11px] font-bold text-gray-700">
                            {order.paymentMethod}
                          </span>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                            disabled={isUpdating}
                            className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 border ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : order.paymentStatus === 'Refunded'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          disabled={isUpdating}
                          className={`text-xs font-bold rounded-xl px-2.5 py-1 border transition-colors ${
                            STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                  Order Details
                </span>
                <h2 className="text-xl font-black text-gray-900 mt-1">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6 text-xs">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary-600" /> Delivery Address
                  </h4>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-gray-600 space-y-1">
                      <p className="font-bold text-gray-900">
                        {selectedOrder.shippingAddress.fullName}
                      </p>
                      <p>{selectedOrder.shippingAddress.addressLine}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                        - {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No address on file</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary-600" /> Payment & Summary
                  </h4>
                  <div className="text-gray-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Method:</span>
                      <span className="font-bold text-gray-900">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <span className="font-bold text-gray-900">
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>
                        ₹{Number(selectedOrder.itemsPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span>
                        {selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-1 text-sm">
                      <span>Grand Total:</span>
                      <span>
                        ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-primary-600" /> Purchased Line Items (
                  {selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://via.placeholder.com/50'}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex gap-2">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            {item.sku && <span>SKU: {item.sku}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-900">
                          ₹{Number(item.price || 0).toLocaleString('en-IN')} x {item.quantity}
                        </div>
                        <div className="text-xs font-black text-primary-700">
                          ₹{(Number(item.price || 0) * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageOrders;
