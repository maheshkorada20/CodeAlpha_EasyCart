import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  ExternalLink,
  Eye,
  CheckCircle,
} from 'lucide-react';

const ManageBanners = () => {
  const { api } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const initialForm = {
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '/products',
    position: 'home_hero',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/banners/all');
      setBanners(data || []);
    } catch (err) {
      console.error('Error fetching admin banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [api]);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      linkUrl: b.linkUrl || '/products',
      position: b.position || 'home_hero',
      isActive: b.isActive !== undefined ? b.isActive : true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, formData);
      } else {
        await api.post('/banners', formData);
      }
      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.delete(`/banners/${id}`);
        fetchBanners();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete banner');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Banners & Offers">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Storefront Banners & Campaigns"
      subtitle="Control homepage hero slides, seasonal promotional callouts, and landing banners"
      action={
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Banner
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {banners.length === 0 ? (
          <div className="lg:col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-200">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-700">No promotional banners configured yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Add hero banners to showcase seasonal promotions on the homepage.
            </p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 sm:h-56 bg-gray-900 group">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm self-start">
                    {banner.position}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1 tracking-tight">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-gray-300 mt-0.5">{banner.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      banner.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <span className="text-gray-400 font-mono text-[11px] truncate max-w-[150px]">
                    {banner.linkUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create New Promotional Banner'}
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
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="e.g. End of Season Mega Sale"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle / Callout</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="e.g. Up to 60% Off on Top Designer Brands"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Link URL</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="/products or /offers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Placement Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-semibold"
                  >
                    <option value="home_hero">Homepage Hero Carousel</option>
                    <option value="middle_banner">Middle Promo Banner</option>
                    <option value="offers_hero">Offers Page Header</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span className="font-semibold text-gray-700">Display this banner on the storefront</span>
              </label>

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
                  {editingBanner ? 'Update Banner' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageBanners;
