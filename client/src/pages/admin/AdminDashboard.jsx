import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Users,
  ShoppingBag,
  IndianRupee,
  Package,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowUpRight,
  Database,
  CheckCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminDashboard = () => {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState('');

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [api]);

  const handleSeedData = async () => {
    if (
      !window.confirm(
        'Populate the database with sample products, categories, coupons, orders, and demo users?'
      )
    ) {
      return;
    }

    setSeeding(true);
    setSeedSuccess('');
    try {
      await api.post('/admin/seed');
      setSeedSuccess('Demo database seeded successfully with realistic e-commerce data!');
      await fetchDashboardStats();
      setTimeout(() => setSeedSuccess(''), 5000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to seed database');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard & Analytics">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  const currentStats = stats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    outOfStockProducts: 0,
    returnRequests: 0,
    recentOrders: [],
    salesData: [],
    orderStatusDistribution: [],
  };

  const statusDistributionData = currentStats.orderStatusDistribution || [
    { name: 'Delivered', value: 12 },
    { name: 'Shipped', value: 8 },
    { name: 'Processing', value: 5 },
    { name: 'Pending', value: currentStats.pendingOrders || 3 },
  ];

  return (
    <AdminLayout
      title="Store Analytics & Operations"
      subtitle="Real-time key performance indicators, sales volume, and customer activity"
      action={
        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {seeding ? 'Seeding Demo Data...' : 'Seed / Reset Demo Data'}
        </button>
      }
    >
      {seedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {seedSuccess}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            ₹{Number(currentStats.totalRevenue || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Lifetime Gross Sales
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {currentStats.totalOrders || 0}
          </h3>
          <p className="text-xs font-semibold text-blue-600 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> All-Time Processed
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {currentStats.totalCustomers || 0}
          </h3>
          <p className="text-xs font-semibold text-purple-600 mt-1">Registered User Accounts</p>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {currentStats.totalProducts || 0}
          </h3>
          <p className="text-xs font-semibold text-amber-600 mt-1">Multi-Variant Products</p>
        </div>
      </div>

      {/* Action Alerts / Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/orders?status=Pending"
          className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-center justify-between hover:bg-amber-100/70 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-amber-900">Pending Orders</h4>
              <p className="text-xs text-amber-700">Awaiting fulfillment</p>
            </div>
          </div>
          <span className="bg-amber-200 text-amber-900 py-1 px-3 rounded-full text-xs font-black">
            {currentStats.pendingOrders || 0}
          </span>
        </Link>

        <Link
          to="/admin/inventory"
          className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl flex items-center justify-between hover:bg-rose-100/70 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-rose-900">Stock Alerts</h4>
              <p className="text-xs text-rose-700">Low or out of stock</p>
            </div>
          </div>
          <span className="bg-rose-200 text-rose-900 py-1 px-3 rounded-full text-xs font-black">
            {currentStats.outOfStockProducts || 0}
          </span>
        </Link>

        <Link
          to="/admin/returns"
          className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between hover:bg-indigo-100/70 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase text-indigo-900">Return Requests</h4>
              <p className="text-xs text-indigo-700">Pending review</p>
            </div>
          </div>
          <span className="bg-indigo-200 text-indigo-900 py-1 px-3 rounded-full text-xs font-black">
            {currentStats.returnRequests || 0}
          </span>
        </Link>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Volume BarChart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                Sales Volume Trend
              </h2>
              <p className="text-xs text-gray-500">Gross revenue generated across recent cycles</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentStats.salesData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Bar dataKey="sales" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution PieChart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">
              Order Fulfillment Breakdown
            </h2>
            <p className="text-xs text-gray-500 mb-4">Current order statuses</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} orders`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900 tracking-tight">Recent Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">Latest customer purchases across the store</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            View All Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50/60 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Order Reference</th>
                <th className="px-6 py-3.5 text-left">Placed On</th>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-left">Total Value</th>
                <th className="px-6 py-3.5 text-left">Payment</th>
                <th className="px-6 py-3.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentStats.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-medium">
                    No orders placed yet. Click "Seed Demo Data" above to populate test orders.
                  </td>
                </tr>
              ) : (
                currentStats.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <Link
                        to={`/admin/orders?search=${order.orderNumber}`}
                        className="hover:text-primary-600"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {order.user?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-gray-400">{order.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        {order.paymentMethod} • {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
