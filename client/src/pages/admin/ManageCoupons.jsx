import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Tag,
  X,
  Search,
  Percent,
  IndianRupee,
  Calendar,
  CheckCircle,
  Copy,
} from 'lucide-react';

const ManageCoupons = () => {
  const { api } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const initialForm = {
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 499,
    maxDiscountAmount: 500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    usageLimit: 1000,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons/admin');
      setCoupons(data || []);
    } catch (err) {
      console.error('Error fetching admin coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [api]);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || 1000,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscountAmount: Number(formData.maxDiscountAmount),
        usageLimit: Number(formData.usageLimit),
      };

      if (editingCoupon) {
        await api.put(`/coupons/admin/${editingCoupon._id}`, payload);
      } else {
        await api.post('/coupons/admin', payload);
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await api.delete(`/coupons/admin/${id}`);
        fetchCoupons();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete coupon');
      }
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Coupons & Discounts">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Coupons & Promotional Discounts"
      subtitle="Create promotional voucher codes, minimum spend thresholds, usage quotas, and expiration dates"
      action={
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create New Coupon
        </button>
      }
    >
      {/* Top Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Search coupon code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs font-bold text-gray-500 flex items-center">
          Active Coupons: <span className="text-gray-900 ml-1">{coupons.filter(c => c.isActive).length}</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Coupon Code</th>
                <th className="px-6 py-3.5 text-left">Discount Type</th>
                <th className="px-6 py-3.5 text-left">Value</th>
                <th className="px-6 py-3.5 text-left">Thresholds</th>
                <th className="px-6 py-3.5 text-left">Validity Period</th>
                <th className="px-6 py-3.5 text-left">Redemptions</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-400 font-medium">
                    No coupons created yet. Click "Create New Coupon" to offer promotions.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-primary-700 bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200 tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-700 capitalize">
                      {coupon.discountType === 'percentage' ? 'Percentage Off' : 'Flat Amount'}
                    </td>

                    <td className="px-6 py-4 font-black text-gray-900 text-sm">
                      {coupon.discountType === 'percentage' ? (
                        <span className="text-emerald-700 flex items-center gap-0.5">
                          {coupon.discountValue}%
                        </span>
                      ) : (
                        <span className="text-emerald-700 flex items-center gap-0.5">
                          ₹{coupon.discountValue}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      <div>Min: ₹{coupon.minOrderAmount || 0}</div>
                      {coupon.discountType === 'percentage' && coupon.maxDiscountAmount > 0 && (
                        <div className="text-[11px] text-gray-400">
                          Cap: ₹{coupon.maxDiscountAmount}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      <div>
                        {coupon.startDate ? new Date(coupon.startDate).toLocaleDateString() : 'Now'}{' '}
                        -
                      </div>
                      <div className="font-semibold text-gray-800">
                        {coupon.endDate
                          ? new Date(coupon.endDate).toLocaleDateString()
                          : 'No expiry'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{coupon.usedCount || 0}</span> /{' '}
                      <span className="text-gray-500">{coupon.usageLimit || '∞'}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCoupon ? 'Edit Coupon Voucher' : 'Create New Coupon Voucher'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none uppercase font-mono font-bold tracking-wider"
                    placeholder="EASYCART20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Usage Quota</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                    />
                    <span className="font-semibold text-gray-700">Coupon Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageCoupons;
