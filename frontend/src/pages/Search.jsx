import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import VendorShowcaseCard from '../modules/App/components/VendorShowcaseCard';
import Header from '../components/Layout/Header';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import PageTransition from '../components/PageTransition';
import Breadcrumbs from '../components/Layout/Breadcrumbs';
import ProductGridSkeleton from '../components/Skeletons/ProductGridSkeleton';
import useResponsiveHeaderPadding from '../hooks/useResponsiveHeaderPadding';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { responsivePadding } = useResponsiveHeaderPadding();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [matchingVendors, setMatchingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]); // All vendors for filter
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    vendor: searchParams.get('vendor') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
  });

  // Fetch initial data (categories and vendors)
  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        const { fetchPublicCategories, fetchPublicVendors } = await import('../services/publicApi');
        const [catRes, venRes] = await Promise.all([
          fetchPublicCategories(),
          fetchPublicVendors()
        ]);
        if (catRes.success) setCategories(catRes.data.categories || []);
        if (venRes.success) setVendors(venRes.data.vendors || []);
      } catch (error) {
        console.error("Error fetching support data:", error);
      }
    };
    fetchSupportData();
  }, []);

  // Fetch products and matching vendors
  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        const { fetchPublicProducts, fetchPublicVendors } = await import('../services/publicApi');
        const query = searchParams.get('q') || '';

        const productParams = {
          search: query,
          categoryId: filters.category,
          vendorId: filters.vendor,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          page,
          limit: 12
        };

        // If it's the first page and we have a search query, also search for vendors
        const vendorsToFetch = (page === 1 && query)
          ? fetchPublicVendors({ search: query, limit: 10 })
          : Promise.resolve({ success: true, data: { vendors: [] } });

        const [prodRes, venRes] = await Promise.all([
          fetchPublicProducts(productParams),
          vendorsToFetch
        ]);

        if (prodRes.success) {
          if (page === 1) {
            setProducts(prodRes.data.products || []);
          } else {
            setProducts(prev => [...prev, ...(prodRes.data.products || [])]);
          }
          setTotalPages(prodRes.data.totalPages || 1);
        }

        if (venRes.success && page === 1) {
          setMatchingVendors(venRes.data.vendors || []);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchParams, page, filters]); // Refetch when params or page or filter object changes

  // Infinite scroll logic
  const hasMore = page < totalPages;
  const isLoading = loading;
  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };
  const filteredProducts = products;
  const displayedItems = products;

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    setSearchParams(newParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('q', searchQuery);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      vendor: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
    });
    setSearchQuery('');
    setSearchParams({});
  };


  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 w-full overflow-x-hidden">
        <Header />
        <Navbar />
        <main className="w-full overflow-x-hidden" style={{ paddingTop: `${responsivePadding}px` }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-2">
            <div className="max-w-7xl mx-auto">
              <Breadcrumbs />
              {/* Search Header */}
              <div className="mb-6">
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full pl-12 pr-4 py-4 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 placeholder:text-gray-400 text-lg"
                    />
                  </div>
                </form>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    Found {products.length} product(s) {matchingVendors.length > 0 && `and ${matchingVendors.length} shop(s)`}
                  </p>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl hover:bg-white/80 transition-colors"
                  >
                    <FiFilter className="text-gray-600" />
                    <span className="font-semibold text-gray-700">Filters</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
                >
                  <div className="glass-card rounded-2xl p-6 sticky top-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                      <button
                        onClick={clearFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Category</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label
                            key={category._id || category.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="category"
                              value={category._id || category.id}
                              checked={filters.category === (category._id || category.id)}
                              onChange={(e) => {
                                handleFilterChange('category', e.target.value);
                                setPage(1);
                              }}
                              className="w-4 h-4 text-green-500"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Vendor Filter */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Vendor</h3>
                      <select
                        value={filters.vendor}
                        onChange={(e) => handleFilterChange('vendor', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="">All Vendors</option>
                        {vendors.map((vendor) => (
                          <option key={vendor._id || vendor.id} value={vendor._id || vendor.id}>
                            {vendor.storeName || vendor.businessName || vendor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Price Range</h3>
                      <div className="space-y-3">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-3">Minimum Rating</h3>
                      <div className="space-y-2">
                        {[4, 3, 2, 1].map((rating) => (
                          <label
                            key={rating}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="minRating"
                              value={rating}
                              checked={filters.minRating === rating.toString()}
                              onChange={(e) => handleFilterChange('minRating', e.target.value)}
                              className="w-4 h-4 text-green-500"
                            />
                            <span className="text-sm text-gray-700">
                              {rating}+ Stars
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                  {/* Matching Shops Section */}
                  {matchingVendors.length > 0 && page === 1 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-rose-500 rounded-full"></span>
                        Shops Found
                      </h2>
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {matchingVendors.map((vendor, idx) => (
                          <div key={vendor._id || vendor.id} className="flex-shrink-0">
                            <VendorShowcaseCard vendor={vendor} index={idx} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {products.length === 0 && matchingVendors.length === 0 ? (
                    <div className="text-center py-12">
                      <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or filters
                      </p>
                      <button
                        onClick={clearFilters}
                        className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
                        {displayedItems.map((product, index) => (
                          <motion.div
                            key={product._id || product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <ProductCard product={product} />
                          </motion.div>
                        ))}
                      </div>

                      {/* Loading indicator and Load More button */}
                      {hasMore && (
                        <div className="mt-8 flex flex-col items-center gap-4">
                          {isLoading && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiLoader className="animate-spin text-xl" />
                              <span>Loading more products...</span>
                            </div>
                          )}
                          <button
                            onClick={loadMore}
                            disabled={isLoading}
                            className="px-6 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Search;

