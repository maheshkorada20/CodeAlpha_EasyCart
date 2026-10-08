import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RotateCcw, Package, AlertCircle, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ReturnRequests = () => {
  const { api } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/returns/my-returns');
      setReturns(data || []);
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleCancelReturn = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this return request?')) return;
    try {
      await api.patch(`/returns/${id}/cancel`);
      await fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel return request');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading return & refund requests..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
        <div>
          <Link
            to="/customer/orders"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-primary-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-primary-600" />
            Returns & Exchanges
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track status, doorstep pickup schedules, and refund progress
          </p>
        </div>
      </div>

      {returns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No return requests"
          description="You haven't requested any returns or exchanges. Delivered orders within the 7-day window can be returned from My Orders."
          actionText="View My Orders"
          actionLink="/customer/orders"
        />
      ) : (
        <div className="space-y-4">
          {returns.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div>
                  <span className="font-bold text-gray-900">
                    Order #{req.order?.orderNumber || 'N/A'}
                  </span>
                  <span className="text-gray-400 ml-2 font-normal">
                    • Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 font-bold rounded-lg text-primary-700 bg-primary-50">
                    {req.requestType}
                  </span>
                  <span
                    className={`px-2.5 py-1 font-bold rounded-lg ${
                      req.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : req.status === 'Cancelled'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    Status: {req.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-500 uppercase tracking-wider text-[11px]">Items:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {req.items?.map((item, i) => (
                    <div key={i} className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                      <span className="font-semibold text-gray-800 line-clamp-1">{item.name}</span>
                      <span className="text-gray-500 font-bold ml-2">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details & Refund */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-gray-500">Reason: <strong className="text-gray-800">{req.reason}</strong></p>
                  {req.description && (
                    <p className="text-gray-500">Note: <span className="text-gray-700 italic">"{req.description}"</span></p>
                  )}
                  {req.adminNotes && (
                    <p className="text-primary-700 bg-primary-50 p-2 rounded-lg mt-1 font-medium">
                      Admin Update: {req.adminNotes}
                    </p>
                  )}
                </div>

                <div className="sm:text-right space-y-1">
                  <p className="text-gray-500">Estimated Refund Amount:</p>
                  <p className="text-base font-black text-gray-900">₹{req.refundAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {req.status === 'Requested' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleCancelReturn(req._id)}
                    className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold"
                  >
                    Cancel Return Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnRequests;
