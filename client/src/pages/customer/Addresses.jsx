import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Plus, Edit2, Trash2, MapPin, X, Check, Building, Home, Briefcase } from 'lucide-react';

const Addresses = () => {
  const { api } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'Home',
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/addresses');
      setAddresses(data);
    } catch (err) {
      console.error('Error fetching addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [api]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      fullName: '',
      phone: '',
      addressLine: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'Home',
      isDefault: addresses.length === 0,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      addressType: addr.addressType || 'Home',
      isDefault: !!addr.isDefault,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingAddress) {
        await api.put(`/addresses/${editingAddress._id}`, formData);
      } else {
        await api.post('/addresses', formData);
      }
      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/addresses/${id}`);
        fetchAddresses();
      } catch (err) {
        console.error('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Saved Addresses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery locations for quick, frictionless checkout</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Saved Addresses Found</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            You have not added any delivery addresses yet. Add one now for instant checkout on EasyCart.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`bg-white border rounded-2xl p-6 relative flex flex-col justify-between transition-all hover:shadow-md ${
                addr.isDefault ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200'
              }`}
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-primary-50 text-primary-700 border border-primary-200 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Default
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                    {addr.addressType === 'Home' ? (
                      <Home className="w-4 h-4" />
                    ) : addr.addressType === 'Work' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <Building className="w-4 h-4" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{addr.fullName}</h3>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                    {addr.addressType}
                  </span>
                </div>

                <div className="text-gray-600 text-xs sm:text-sm space-y-1 mb-6 mt-3 leading-relaxed">
                  <p className="font-medium text-gray-800">{addr.addressLine}</p>
                  <p>
                    {addr.city}, {addr.state} - <span className="font-semibold">{addr.postalCode}</span>
                  </p>
                  <p className="text-gray-500">{addr.country}</p>
                  <p className="pt-2 text-gray-900 font-semibold flex items-center gap-1">
                    <span className="text-gray-400 font-normal">Phone:</span> {addr.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openEditModal(addr)}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-rose-500 hover:text-rose-700 font-semibold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Delivery Address'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="Mahesh Kumar"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Street Address / Flat / Floor *</label>
                <textarea
                  rows="2"
                  required
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Flat 402, Sunshine Heights, MG Road"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="Bengaluru"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="Karnataka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PIN / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    placeholder="560001"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={formData.country}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl"
                  />
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Address Type</label>
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        formData.addressType === type
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Is Default Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span className="font-semibold text-gray-700">Make this my default shipping address</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
