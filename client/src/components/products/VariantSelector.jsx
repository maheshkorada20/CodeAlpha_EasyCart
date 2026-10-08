import { Check } from 'lucide-react';

const VariantSelector = ({ variants = [], selectedVariant, onSelectVariant }) => {
  if (!variants || variants.length === 0) return null;

  // Extract unique colors and sizes
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

  const handleColorClick = (color) => {
    // Pick variant with this color and current size if possible, or first with this color
    const matching = variants.find(v => v.color === color && v.size === selectedVariant?.size)
      || variants.find(v => v.color === color);
    if (matching) onSelectVariant(matching);
  };

  const handleSizeClick = (size) => {
    // Pick variant with this size and current color if possible, or first with this size
    const matching = variants.find(v => v.size === size && v.color === selectedVariant?.color)
      || variants.find(v => v.size === size);
    if (matching) onSelectVariant(matching);
  };

  return (
    <div className="space-y-4 my-4">
      {/* Color Selection */}
      {uniqueColors.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            <span>Color: <strong className="text-gray-900 normal-case">{selectedVariant?.color || 'Select Color'}</strong></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => {
              const isSelected = selectedVariant?.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorClick(color)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50 text-primary-700 ring-1 ring-primary-600'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {uniqueSizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            <span>Size: <strong className="text-gray-900 normal-case">{selectedVariant?.size || 'Select Size'}</strong></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.map((size) => {
              const isSelected = selectedVariant?.size === size;
              const matchingVariant = variants.find(v => v.size === size && (uniqueColors.length === 0 || v.color === selectedVariant?.color));
              const isOutOfStock = matchingVariant ? matchingVariant.stock <= 0 : false;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleSizeClick(size)}
                  className={`min-w-[48px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                      : isOutOfStock
                      ? 'border-gray-200 bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock and SKU Notice */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-gray-400">
          SKU: <strong className="text-gray-600 font-mono">{selectedVariant?.sku || 'N/A'}</strong>
        </span>
        {selectedVariant && (
          <div>
            {selectedVariant.stock > 0 ? (
              selectedVariant.stock <= 5 ? (
                <span className="text-amber-600 font-semibold">
                  Hurry, only {selectedVariant.stock} left in stock!
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">In Stock</span>
              )
            ) : (
              <span className="text-rose-600 font-semibold">Out of Stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VariantSelector;
