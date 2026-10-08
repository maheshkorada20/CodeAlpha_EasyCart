import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

const ManageProducts = () => {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const initialForm = {
    name: '',
    brandName: '',
    category: '',
    description: '',
    imagesText: '',
    tagsText: '',
    variants: [
      {
        size: 'Standard',
        color: 'Default',
        sku: '',
        price: 999,
        discountPrice: 799,
        stock: 50,
      },
    ],
  };
  const [formData, setFormData] = useState(initialForm);

  // Quick Category State
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const fetchProductsAndCategories = async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        api.get('/products?limit=200'),
        api.get('/categories'),
      ]);
      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data.products || []);
      }
      if (catRes.status === 'fulfilled') {
        const catList = catRes.value.data || [];
        setCategories(catList);
        // Preselect category if not selected
        setFormData((prev) => {
          if (!prev.category && catList.length > 0) {
            return { ...prev, category: catList[0]._id };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!quickCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const { data } = await api.post('/categories', { name: quickCategoryName.trim() });
      setCategories((prev) => [...prev, data]);
      setFormData((prev) => ({ ...prev, category: data._id }));
      setQuickCategoryName('');
      setShowQuickCategory(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSeedDefaultCategories = async () => {
    setCreatingCategory(true);
    try {
      const { data } = await api.post('/categories/seed');
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category: data.categories[0]._id }));
        }
      }
    } catch (err) {
      // Fallback fetch
      const res = await api.get('/categories');
      if (res.data?.length > 0) {
        setCategories(res.data);
        setFormData((prev) => ({ ...prev, category: res.data[0]._id }));
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, [api]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      ...initialForm,
      category: categories[0]?._id || '',
      variants: [
        {
          size: 'M',
          color: 'Black',
          sku: `SKU-${Date.now().toString().slice(-5)}`,
          price: 999,
          discountPrice: 799,
          stock: 50,
        },
      ],
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      brandName: p.brandName || '',
      category: p.category?._id || p.category || '',
      description: p.description || '',
      imagesText: (p.images || []).join('\n'),
      tagsText: (p.tags || []).join(', '),
      variants: p.variants?.length
        ? p.variants.map((v) => ({
            variantId: v.variantId || '',
            size: v.size || 'Standard',
            color: v.color || 'Default',
            sku: v.sku || '',
            price: v.price || 0,
            discountPrice: v.discountPrice || v.price || 0,
            stock: v.stock || 0,
          }))
        : initialForm.variants,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          size: 'L',
          color: 'Blue',
          sku: `SKU-${Date.now().toString().slice(-5)}`,
          price: formData.variants[0]?.price || 999,
          discountPrice: formData.variants[0]?.discountPrice || 799,
          stock: 25,
        },
      ],
    });
  };

  const handleRemoveVariantRow = (index) => {
    if (formData.variants.length <= 1) {
      alert('A product must have at least one variant.');
      return;
    }
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, variants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const imagesArray = formData.imagesText
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean);

      const tagsArray = formData.tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        brandName: formData.brandName,
        category: formData.category,
        description: formData.description,
        images: imagesArray.length
          ? imagesArray
          : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
        tags: tagsArray,
        variants: formData.variants.map((v, i) => ({
          variantId: v.variantId || `var-${Date.now()}-${i}`,
          size: v.size,
          color: v.color,
          sku: v.sku || `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          price: Number(v.price),
          discountPrice: Number(v.discountPrice || v.price),
          stock: Number(v.stock),
        })),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setModalOpen(false);
      fetchProductsAndCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/products/${id}/status`, { isActive: !currentStatus });
      setProducts(products.map((p) => (p._id === id ? { ...p, isActive: !currentStatus } : p)));
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      p.category?._id === selectedCategory ||
      p.category === selectedCategory ||
      p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AdminLayout title="Products & Variants">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Product Catalog & Variant Management"
      subtitle="Create, edit, organize inventory, and manage product variants (sizes, colors, SKUs, pricing)"
      action={
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      }
    >
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Search by product name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">Product</th>
                <th className="px-6 py-3.5 text-left">Category</th>
                <th className="px-6 py-3.5 text-left">Variants</th>
                <th className="px-6 py-3.5 text-left">Price Range</th>
                <th className="px-6 py-3.5 text-left">Stock</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                    No products matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const mainVariant = product.variants?.[0] || {};
                  const minPrice = Math.min(
                    ...(product.variants?.map((v) => v.discountPrice || v.price) || [0])
                  );
                  const maxPrice = Math.max(
                    ...(product.variants?.map((v) => v.discountPrice || v.price) || [0])
                  );
                  const totalStock =
                    product.variants?.reduce((tot, v) => tot + (v.stock || 0), 0) || 0;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">
                              {product.brandName}
                            </span>
                            <span className="font-bold text-gray-900 line-clamp-1">
                              {product.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-600">
                        {product.category?.name || 'General'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-bold">
                          <Layers className="w-3 h-3" /> {product.variants?.length || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{minPrice.toLocaleString('en-IN')}
                        {maxPrice > minPrice && ` - ₹${maxPrice.toLocaleString('en-IN')}`}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`font-bold ${
                            totalStock === 0
                              ? 'text-rose-600'
                              : totalStock < 10
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleProductStatus(product._id, product.isActive)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                            product.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1.5 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Product & Variants"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingProduct ? 'Edit Product & Variants' : 'Add New Product'}
                </h2>
                <p className="text-xs text-gray-500">
                  Fill in product specifications and define available variant combinations
                </p>
              </div>
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

            <form onSubmit={handleSubmit} className="mt-4 space-y-5 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="e.g. Slim-Fit Linen Oxford Shirt"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="e.g. UrbanStride"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">
                      Category * {categories.length > 0 && <span className="text-gray-400 font-normal">({categories.length})</span>}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickCategory(!showQuickCategory)}
                        className="text-primary-600 hover:text-primary-800 font-bold text-[11px] hover:underline"
                      >
                        {showQuickCategory ? 'Close' : '+ New Category'}
                      </button>
                    </div>
                  </div>

                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-semibold text-xs"
                  >
                    <option value="">{categories.length === 0 ? 'No categories available' : 'Select Category'}</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Empty Categories Warning & Auto-Seed Button */}
                  {categories.length === 0 && (
                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                      <span className="text-[11px] text-amber-800 font-medium">Categories list is empty</span>
                      <button
                        type="button"
                        disabled={creatingCategory}
                        onClick={handleSeedDefaultCategories}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold transition shadow-sm"
                      >
                        {creatingCategory ? 'Loading...' : '⚡ Load Default Categories'}
                      </button>
                    </div>
                  )}

                  {/* Quick Add Category inline form */}
                  {showQuickCategory && (
                    <div className="mt-2 p-2.5 bg-primary-50/50 border border-primary-100 rounded-xl flex items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="e.g. Denim & Jeans, Shirts"
                        value={quickCategoryName}
                        onChange={(e) => setQuickCategoryName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickCreateCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={creatingCategory || !quickCategoryName.trim()}
                        onClick={handleQuickCreateCategory}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition disabled:opacity-50"
                      >
                        {creatingCategory ? 'Adding...' : 'Add & Select'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowQuickCategory(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsText}
                    onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="shirt, linen, summer, trending"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Detailed product highlights, material specifications, and features..."
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Product Image URLs (one URL per line)
                </label>
                <textarea
                  rows="2"
                  value={formData.imagesText}
                  onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-[11px]"
                  placeholder="https://images.unsplash.com/photo-xxx&#10;https://images.unsplash.com/photo-yyy"
                />
              </div>

              {/* Dynamic Variants Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Product Variants (Size, Color, Price, Stock)
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Each variant maps to a distinct size/color option with individual inventory
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-[11px] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-6 gap-2 items-center"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Size
                        </label>
                        <input
                          type="text"
                          required
                          value={v.size}
                          onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                          placeholder="M, L, XL"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Color
                        </label>
                        <input
                          type="text"
                          required
                          value={v.color}
                          onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
                          placeholder="Navy Blue"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={v.price}
                          onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Selling (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={v.discountPrice}
                          onChange={(e) =>
                            handleVariantChange(idx, 'discountPrice', e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-primary-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">
                          Stock
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={v.stock}
                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div className="flex items-end justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-100"
                          title="Remove Variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Actions */}
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
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageProducts;
