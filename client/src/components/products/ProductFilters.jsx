import { RotateCcw, Star } from 'lucide-react';

const ProductFilters = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  priceRange = { min: '', max: '' },
  onChangePriceRange,
  selectedRating,
  onSelectRating,
  inStockOnly,
  onToggleInStock,
  onClearFilters,
  totalCount,
}) => {
  const hasActiveFilters = selectedCategory || priceRange.min || priceRange.max || selectedRating || inStockOnly;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Filters</h3>
          {totalCount !== undefined && (
            <span className="text-xs text-gray-500">{totalCount} items found</span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Category</h4>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-primary-600">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => onSelectCategory('')}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat._id}
              className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer hover:text-primary-600"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat._id}
                onChange={() => onSelectCategory(cat._id)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="truncate">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Min Price</label>
            <input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => onChangePriceRange({ ...priceRange, min: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Max Price</label>
            <input
              type="number"
              placeholder="50000"
              value={priceRange.max}
              onChange={(e) => onChangePriceRange({ ...priceRange, max: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Customer Rating */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Customer Rating</h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => onSelectRating(selectedRating === stars ? null : stars)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                selectedRating === stars
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{stars}★ & above</span>
              </div>
              <div className="flex text-amber-400">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-3 border-t border-gray-100">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-semibold text-gray-700">In-Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStock(e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
          />
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
