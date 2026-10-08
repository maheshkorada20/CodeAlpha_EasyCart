import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  Search,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';

const STATUS_COLORS = {
  Requested: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-blue-100 text-blue-800 border-blue-200',
  Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  'Item Received': 'bg-purple-100 text-purple-800 border-purple-200',
  'Refund Initiated': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const ManageReturns = () => {
  const { api } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Review Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [refundStatus, setRefundStatus] = useState('Pending');
  const [refundAmount, setRefundAmount] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    try {
      const { data } = await api.get('/admin/returns');
      setRequests(data.returnRequests || []);
    } catch (err) {
      console.error('Error fetching return requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, [api]);

  const openReviewModal = (req) => {
    setSelectedReq(req);
    setReviewStatus(req.status === 'Requested' ? 'Approved' : req.status);
    setRefundStatus(req.refundStatus || 'Pending');
    setRefundAmount(req.refundAmount || req.item?.price * (req.item?.quantity || 1) || 0);
    setAdminNotes(req.adminNotes || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmitting(true);

    try {
      await api.patch(`/admin/returns/${selectedReq._id}/status`, {
        status: reviewStatus,
        refundStatus,
        refundAmount: Number(refundAmount),
        adminNotes,
      });
      setSelectedReq(null);
      fetchReturns();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update return request');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = activeFilter === 'All' || r.status === activeFilter;
    const matchesSearch =
      r.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout title="Returns & Refunds">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  const allStatuses = [
    'Requested',
    'Approved',
    'Rejected',
    'Item Received',
    'Refund Initiated',
    'Completed',
  ];

  return (
    <AdminLayout
      title="Returns, Exchanges & Refund Processing"
      subtitle="Inspect customer return and exchange disputes, authorize claims, and release reverse refunds"
    >
      {/* Search & Tabs */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Search by order #, customer, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="text-xs font-bold text-gray-500">
            Total Requests: <span className="text-gray-900">{requests.length}</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['All', ...allStatuses].map((filter) => {
            const count =
              filter === 'All'
                ? requests.length
                : requests.filter((r) => r.status === filter).length;
            const isActive = activeFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{filter}</span>
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

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Order #</th>
                <th className="px-6 py-3.5 text-left">Customer</th>
                <th className="px-6 py-3.5 text-left">Item Details</th>
                <th className="px-6 py-3.5 text-left">Request Type & Reason</th>
                <th className="px-6 py-3.5 text-left">Refund Amount</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                    No return or exchange requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {req.order?.orderNumber || 'N/A'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {req.user?.name || 'Customer'}
                      </div>
                      <div className="text-[11px] text-gray-400">{req.user?.email || ''}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {req.item?.image && (
                          <img
                            src={req.item.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover border"
                          />
                        )}
                        <div>
                          <div className="font-bold text-gray-800 line-clamp-1">
                            {req.item?.name || 'Product Item'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {req.item?.size ? `Size: ${req.item.size} ` : ''}
                            {req.item?.color ? `• Color: ${req.item.color}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold uppercase text-[10px] text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {req.type || 'Return'}
                      </span>
                      <p className="text-gray-600 mt-1 line-clamp-1">{req.reason}</p>
                    </td>

                    <td className="px-6 py-4 font-black text-gray-900">
                      ₹{Number(req.refundAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openReviewModal(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl font-bold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Review Customer Claim</h2>
                <p className="text-xs text-gray-500">Order: {selectedReq.order?.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 my-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
              <p>
                <span className="font-bold text-gray-700">Customer Reason:</span>{' '}
                {selectedReq.reason}
              </p>
              {selectedReq.additionalComments && (
                <p>
                  <span className="font-bold text-gray-700">Comments:</span>{' '}
                  {selectedReq.additionalComments}
                </p>
              )}
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Claim Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Refund Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Refund Status</label>
                  <select
                    value={refundStatus}
                    onChange={(e) => setRefundStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processed">Processed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Admin Resolution Notes
                </label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="e.g. Approved. Customer will receive a replacement unit / refund in 3 days."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageReturns;
