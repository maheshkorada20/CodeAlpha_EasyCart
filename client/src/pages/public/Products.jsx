import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Filter, X, ArrowUpDown, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import ProductCard from '../../components/products/ProductCard';
import ProductFilters from '../../components/products/ProductFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Products = () => {
  const { api } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // URL Query Parameters
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') || '';
  const isFeatured = searchParams.get('isFeatured') || '';
  const isBestSeller = searchParams.get('isBestSeller') || '';
  const isNewArrival = searchParams.get('isNewArrival') || '';
  const page = Number(searchParams.get('page')) || 1;

  // Fetch categories once
  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  // Fetch products whenever search params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '12');

        if (keyword) params.set('keyword', keyword);
        if (category) {
          // If category is a slug, find matching category ID
          const matchedCat = categories.find(c => c.slug === category);
          params.set('category', matchedCat ? matchedCat._id : category);
        }
        if (sort) params.set('sort', sort);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (rating) params.set('rating', rating);
        if (inStock) params.set('inStock', inStock);
        if (isFeatured) params.set('isFeatured', isFeatured);
        if (isBestSeller) params.set('isBestSeller', isBestSeller);
        if (isNewArrival) params.set('isNewArrival', isNewArrival);

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotalCount(data.totalCount || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category, sort, minPrice, maxPrice, rating, inStock, isFeatured, isBestSeller, isNewArrival, page, categories]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleClearAll = () => {
    const next = new URLSearchParams();
    if (keyword) next.set('keyword', keyword);
    setSearchParams(next);
  };

  const activeCategoryObj = categories.find(c => c._id === category || c.slug === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {keyword ? `Search: "${keyword}"` : activeCategoryObj ? activeCategoryObj.name : 'All Products'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {products.length} of {totalCount} items
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm"
          >
            <Filter className="w-4 h-4 mr-1.5 text-gray-500" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
              <option value="discount">Biggest Discounts</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <div className="sticky top-24">
            <ProductFilters
              categories={categories}
              selectedCategory={activeCategoryObj?._id || category}
              onSelectCategory={(id) => updateParam('category', id)}
              priceRange={{ min: minPrice, max: maxPrice }}
              onChangePriceRange={({ min, max }) => {
                const next = new URLSearchParams(searchParams);
                if (min) next.set('minPrice', min); else next.delete('minPrice');
                if (max) next.set('maxPrice', max); else next.delete('maxPrice');
                next.delete('page');
                setSearchParams(next);
              }}
              selectedRating={rating ? Number(rating) : null}
              onSelectRating={(r) => updateParam('rating', r ? r.toString() : '')}
              inStockOnly={inStock === 'true'}
              onToggleInStock={(checked) => updateParam('inStock', checked ? 'true' : '')}
              onClearFilters={handleClearAll}
              totalCount={totalCount}
            />
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <LoadingSpinner text="Searching products..." />
          ) : products.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              description="Try adjusting your filters, price range, or search keywords to find what you are looking for."
              actionText="Reset All Filters"
              actionLink="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-12 pt-6 border-t border-gray-100">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', (page - 1).toString())}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParam('page', pageNum.toString())}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          pageNum === page
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', (page + 1).toString())}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-5 overflow-y-auto z-10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Filter Products</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1">
              <ProductFilters
                categories={categories}
                selectedCategory={activeCategoryObj?._id || category}
                onSelectCategory={(id) => {
                  updateParam('category', id);
                  setMobileFilterOpen(false);
                }}
                priceRange={{ min: minPrice, max: maxPrice }}
                onChangePriceRange={({ min, max }) => {
                  const next = new URLSearchParams(searchParams);
                  if (min) next.set('minPrice', min); else next.delete('minPrice');
                  if (max) next.set('maxPrice', max); else next.delete('maxPrice');
                  next.delete('page');
                  setSearchParams(next);
                }}
                selectedRating={rating ? Number(rating) : null}
                onSelectRating={(r) => updateParam('rating', r ? r.toString() : '')}
                inStockOnly={inStock === 'true'}
                onToggleInStock={(checked) => updateParam('inStock', checked ? 'true' : '')}
                onClearFilters={handleClearAll}
                totalCount={totalCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
