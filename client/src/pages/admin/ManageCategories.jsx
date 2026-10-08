import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  X,
  Search,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageCategories = () => {
  const { api } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    description: '',
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [api]);

  const openAddModal = () => {
    setEditingCat(null);
    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      isActive: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      image: cat.image || '',
      description: cat.description || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingCat) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to delete this category? Products in this category may become uncategorized.'
      )
    ) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setLoading(true);
      await api.post('/categories/seed');
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to seed categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Categories Management">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Storefront Category Hierarchy"
      subtitle="Organize product catalog categories, navigation thumbnails, and landing page collections"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200"
            title="Populate standard e-commerce categories"
          >
            ⚡ Seed Defaults
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Category
          </button>
        </div>
      }
    >
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-xs font-bold text-gray-500 flex items-center">
          Total Categories: <span className="text-gray-900 ml-1">{categories.length}</span>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="relative h-44 bg-gray-100">
              <img
                src={
                  cat.image ||
                  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80'
                }
                alt={cat.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                <span className="text-white font-black text-lg tracking-tight">{cat.name}</span>
                <span className="text-gray-300 text-xs font-mono mt-0.5">/{cat.slug}</span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {cat.description || 'Primary storefront product category.'}
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 text-xs">
                <Link
                  to={`/category/${cat.slug}`}
                  target="_blank"
                  className="text-gray-500 hover:text-primary-600 font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Public
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No Categories Found</h3>
          <p className="text-xs text-gray-500 mb-4">
            Get started by seeding standard catalog categories or create your custom category.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleSeedDefaults}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              ⚡ Seed Default Categories
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
            >
              + Create Category
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCat ? 'Edit Category' : 'Create New Category'}
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
                <label className="block font-semibold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="e.g. Men's Fashion"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                  placeholder="e.g. mens-fashion"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Brief synopsis for SEO and category cards..."
                />
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
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageCategories;
