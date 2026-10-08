import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, MapPin, Heart, Bell, 
  ArrowRight, Clock, CheckCircle2, ChevronRight, User, Package
} from 'lucide-react';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, addressRes, notifRes] = await Promise.allSettled([
          api.get('/api/orders/my-orders'),
          api.get('/api/addresses'),
          api.get('/api/notifications')
        ]);

        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data || []);
        if (addressRes.status === 'fulfilled') setAddresses(addressRes.value.data || []);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [api]);

  const activeOrders = orders.filter(
    (o) => !['Delivered', 'Cancelled', 'Refunded'].includes(o.orderStatus)
  );

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 rounded-2xl shadow-lg p-6 sm:p-8 text-white mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/40">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    Hello, {user?.name || 'Customer'}!
                  </h1>
                  <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                    {user?.role || 'Customer'}
                  </span>
                </div>
                <p className="text-primary-100 text-sm mt-1">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-primary-700 hover:bg-primary-50 rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Store
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Link
            to="/customer/orders"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{orders.length}</div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activeOrders.length} in transit / processing
            </p>
          </Link>

          <Link
            to="/customer/addresses"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Saved Addresses
              </span>
              <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{addresses.length}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for fast checkout</p>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Saved Wishlist
              </span>
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">Items</div>
            <p className="text-xs text-gray-500 mt-1">Products you love</p>
          </Link>

          <Link
            to="/customer/notifications"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Notifications
              </span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{notifications.length}</div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {unreadNotifications > 0 ? `${unreadNotifications} unread messages` : 'All caught up'}
            </p>
          </Link>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                  <p className="text-xs text-gray-500">Track and manage your latest orders</p>
                </div>
                <Link
                  to="/customer/orders"
                  className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1 group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-gray-600 font-medium">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Start discovering trendy items in our store</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order._id} className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">
                              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                order.orderStatus === 'Delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : order.orderStatus === 'Cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-primary-50 text-primary-700'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold text-gray-900">
                            ₹{Number(order.totalAmount || order.totalPrice || 0).toLocaleString('en-IN')}
                          </span>
                          <p className="text-xs text-gray-500">{order.items?.length || 0} item(s)</p>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                          {order.items?.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0"
                              title={item.name}
                            >
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <span className="text-xs text-gray-500 font-medium pl-1">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/customer/orders/${order._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account Quick Links & Profile Card (Right 1 col) */}
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-600" />
                Account Details
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500">Full Name</span>
                  <p className="font-semibold text-gray-900">{user?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Email Address</span>
                  <p className="font-semibold text-gray-900 break-all">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Phone Number</span>
                  <p className="font-semibold text-gray-900">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <Link
                  to="/customer/profile"
                  className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Quick Navigation Panel */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">Quick Navigation</h3>
              <div className="space-y-1 text-sm">
                <Link
                  to="/customer/orders"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    My Orders
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  to="/customer/addresses"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Manage Addresses
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-gray-400" />
                    My Wishlist
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  to="/customer/notifications"
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-gray-400" />
                    Notifications
                  </span>
                  {unreadNotifications > 0 && (
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
