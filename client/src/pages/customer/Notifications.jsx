import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, CheckCheck, Trash2, Package, Tag, Info, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Notifications = () => {
  const { api } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {}
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'orders') return n.type?.includes('order') || n.relatedOrder;
    if (filter === 'promo') return n.type === 'promo';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading notification alerts..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            Notification Center
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            You have <strong className="text-primary-600">{unreadCount} unread</strong> notifications
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-primary-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 pb-4 overflow-x-auto">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'orders', label: 'Orders & Deliveries' },
          { key: 'promo', label: 'Offers & Coupons' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filter === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are all caught up! Order updates, shipping alerts, and promotions will appear here."
          actionText="Browse Deals"
          actionLink="/offers"
        />
      ) : (
        <div className="space-y-3 mt-4">
          {filteredNotifications.map((notif) => {
            const isOrder = notif.type?.includes('order') || notif.relatedOrder;
            const isPromo = notif.type === 'promo';

            return (
              <div
                key={notif._id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  notif.isRead
                    ? 'bg-white border-gray-100 text-gray-700'
                    : 'bg-primary-50/40 border-primary-200 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3.5 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOrder
                        ? 'bg-emerald-100 text-emerald-700'
                        : isPromo
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-primary-100 text-primary-700'
                    }`}
                  >
                    {isOrder ? <Package className="w-4 h-4" /> : isPromo ? <Tag className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center space-x-4 pt-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {notif.relatedOrder && (
                        <Link
                          to={`/customer/orders/${notif.relatedOrder}`}
                          className="text-[11px] font-bold text-primary-600 hover:underline inline-flex items-center"
                        >
                          View Order <ArrowRight className="w-3 h-3 ml-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                      title="Mark as Read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
