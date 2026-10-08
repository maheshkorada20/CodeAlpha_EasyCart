import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Search,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

const ManageReviews = () => {
  const { api } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('All');

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/admin/reviews');
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [api]);

  const handleModerate = async (id, isApproved) => {
    try {
      await api.patch(`/admin/reviews/${id}/moderation`, {
        isApproved,
        status: isApproved ? 'Approved' : 'Rejected',
      });
      setReviews(
        reviews.map((r) =>
          r._id === id
            ? { ...r, isApproved, status: isApproved ? 'Approved' : 'Rejected' }
            : r
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate review');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesRating =
      filterRating === 'All' || r.rating === Number(filterRating);
    const matchesSearch =
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout title="Review Moderation">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Customer Review Moderation"
      subtitle="Screen customer feedback, verify authenticity, and approve or hide ratings on product pages"
    >
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Search reviews by comment, customer, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="All">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-700">No reviews found matching criteria</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-6 hover:shadow-md transition-all"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-current' : 'text-gray-200 fill-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-bold text-gray-900 text-sm">{rev.title}</span>

                  {rev.isVerifiedPurchase && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Buyer
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>

                <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-3 pt-2">
                  <span>By: <strong className="text-gray-700">{rev.user?.name || 'Anonymous'}</strong></span>
                  <span>•</span>
                  <span>Product: <strong className="text-gray-700">{rev.product?.name || 'General Product'}</strong></span>
                  <span>•</span>
                  <span>
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 self-end sm:self-center">
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full mb-1 ${
                    rev.isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {rev.isApproved ? 'Visible (Approved)' : 'Hidden (Rejected)'}
                </span>

                <div className="flex items-center gap-2">
                  {!rev.isApproved ? (
                    <button
                      onClick={() => handleModerate(rev._id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerate(rev._id, false)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Hide Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageReviews;
