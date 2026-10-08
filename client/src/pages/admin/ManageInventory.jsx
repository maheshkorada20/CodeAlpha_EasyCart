import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Loader2,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Search,
  Check,
  Plus,
  Minus,
  Save,
  Filter,
} from 'lucide-react';

const ManageInventory = () => {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'out'
  const [editingStocks, setEditingStocks] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchInventory = async () => {
    try {
      const { data } = await api.get(`/admin/inventory?filter=${stockFilter}`);
      setItems(data || []);
      const initialMap = {};
      (data || []).forEach((item) => {
        initialMap[`${item.productId}_${item.variantId}`] = item.stock;
      });
      setEditingStocks(initialMap);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [api, stockFilter]);

  const handleStockChange = (key, val) => {
    setEditingStocks((prev) => ({
      ...prev,
      [key]: Math.max(0, parseInt(val) || 0),
    }));
  };

  const handleQuickAdjust = (key, delta) => {
    setEditingStocks((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const handleSaveStock = async (item) => {
    const key = `${item.productId}_${item.variantId}`;
    const newStock = editingStocks[key];
    setSavingId(key);
    try {
      await api.patch('/admin/inventory/stock', {
        productId: item.productId,
        variantId: item.variantId,
        stock: newStock,
      });

      setSuccessMsg(`Updated SKU ${item.sku || item.productName} to ${newStock} units`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const outOfStockCount = items.filter((i) => i.stock === 0).length;
  const lowStockCount = items.filter((i) => i.stock > 0 && i.stock <= 10).length;

  if (loading) {
    return (
      <AdminLayout title="Inventory Monitor">
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Warehouse Inventory & Stock Monitor"
      subtitle="Track stock levels per size/color variant in real time, set re-order alerts, and update inventory"
    >
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Stock Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStockFilter('all')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            stockFilter === 'all'
              ? 'bg-white border-primary-600 ring-2 ring-primary-500/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tracked Variants
            </span>
            <PackageCheck className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{items.length}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">All catalog variant entries</p>
        </button>

        <button
          onClick={() => setStockFilter('low')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            stockFilter === 'low'
              ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Low Stock Alert (&le; 10)
            </span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{lowStockCount}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Needs warehouse replenishment</p>
        </button>

        <button
          onClick={() => setStockFilter('out')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            stockFilter === 'out'
              ? 'bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Out of Stock (0 Units)
            </span>
            <PackageX className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">{outOfStockCount}</div>
          <p className="text-[11px] text-rose-700 mt-0.5">Customer checkout blocked</p>
        </button>
      </div>

      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
            placeholder="Search by SKU, product, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-xs font-bold text-gray-500 flex items-center">
          Showing <span className="text-gray-900 mx-1">{filteredItems.length}</span> variant rows
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-left">SKU Code</th>
                <th className="px-6 py-3.5 text-left">Product & Brand</th>
                <th className="px-6 py-3.5 text-left">Category</th>
                <th className="px-6 py-3.5 text-left">Variant Details</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-left">In Stock</th>
                <th className="px-6 py-3.5 text-right">Instant Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                    No inventory records match filter or search term.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const key = `${item.productId}_${item.variantId}`;
                  const currentStockVal =
                    editingStocks[key] !== undefined ? editingStocks[key] : item.stock;
                  const hasChanged = currentStockVal !== item.stock;
                  const isSaving = savingId === key;

                  return (
                    <tr key={key} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-gray-900">
                        {item.sku || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">
                          {item.brand}
                        </span>
                        <span className="font-bold text-gray-900 line-clamp-1">
                          {item.productName}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-semibold text-gray-600">{item.category}</td>

                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {item.size} • {item.color}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.stock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : item.stock <= 10
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.stock === 0
                            ? 'Out of Stock'
                            : item.stock <= 10
                            ? 'Low Stock'
                            : 'Healthy'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-black text-gray-900 text-sm">
                        {item.stock} units
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(key, -10)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center text-xs"
                            title="-10 units"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(key, -1)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center"
                            title="-1 unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={currentStockVal}
                            onChange={(e) => handleStockChange(key, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center font-bold text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(key, 1)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center"
                            title="+1 unit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(key, 10)}
                            className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold flex items-center justify-center text-xs"
                            title="+10 units"
                          >
                            +10
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveStock(item)}
                            disabled={!hasChanged || isSaving}
                            className={`ml-1 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                              hasChanged
                                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            Save
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
    </AdminLayout>
  );
};

export default ManageInventory;
