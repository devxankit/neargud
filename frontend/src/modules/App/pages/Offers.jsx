import { useState, useMemo, useEffect, useRef } from "react";
import { FiArrowLeft, FiFilter, FiGrid, FiList, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import ProductCard from "../../../components/ProductCard";
import ProductListItem from "../components/ProductListItem";
import { fetchPublicProducts } from "../../../services/publicApi";
import PageTransition from "../../../components/PageTransition";
import ProductSkeleton from "../../../components/Skeletons/ProductCardSkeleton";

const MobileOffers = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  const fetchData = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const params = {
        hasDiscount: true,
        page: pageNum,
        limit: 10,
        sort: '-discount',
        ...filters
      };
      const res = await fetchPublicProducts(params);
      if (res.success) {
        const newProducts = res.data.products;
        setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
        setHasMore(newProducts.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, false);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1, true);
    }
  };

  const filterButtonRef = useRef(null);

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      minRating: "",
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.minRating;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilters &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target) &&
        !event.target.closest(".filter-dropdown")
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showFilters]);

  return (
    <PageTransition>
      <MobileLayout showBottomNav={true} showCartBar={true}>
        <div className="w-full pb-24">
          {/* Header */}
          <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-1 z-30">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiArrowLeft className="text-xl text-gray-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800">Special Offers</h1>
                <p className="text-sm text-gray-600">
                  {products.length} {products.length === 1 ? "offer" : "offers"} loaded
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600"}`}>
                    <FiList className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white text-primary-600 shadow-sm" : "text-gray-600"}`}>
                    <FiGrid className="text-lg" />
                  </button>
                </div>
                <div ref={filterButtonRef} className="relative">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 glass-card rounded-xl hover:bg-white/80 transition-colors ${showFilters ? "bg-white/80" : ""}`}>
                    <FiFilter className={`text-lg transition-colors ${hasActiveFilters ? "text-blue-600" : "text-gray-600"}`} />
                  </button>
                  <AnimatePresence>
                    {showFilters && (
                      <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/20 z-[10000]" />
                        <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="filter-dropdown absolute right-0 top-full w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-[10001] overflow-hidden" style={{ marginTop: "-50px" }}>
                          <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="p-0.5 hover:bg-gray-200 rounded-full"><FiX className="text-sm text-gray-600" /></button>
                          </div>
                          <div className="p-2 space-y-2">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1 text-xs">Price Range</h4>
                              <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange("minPrice", e.target.value)} className="w-full px-2 py-1.5 rounded-md border text-xs mb-1" />
                              <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange("maxPrice", e.target.value)} className="w-full px-2 py-1.5 rounded-md border text-xs" />
                            </div>
                          </div>
                          <div className="border-t p-2 bg-gray-50">
                            <button onClick={clearFilters} className="w-full py-1.5 bg-gray-200 text-gray-700 rounded-md font-semibold text-xs mb-1">Clear</button>
                            <button onClick={() => setShowFilters(false)} className="w-full py-1.5 gradient-green text-white rounded-md font-semibold text-xs">Apply</button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4">
            {products.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mx-auto mb-4">🎁</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No offers found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product, index) => (
                    <motion.div key={product._id || product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                  {loading && [1, 2, 3, 4].map(i => <ProductSkeleton key={i} />)}
                </div>
                {hasMore && !loading && (
                  <div className="mt-8 text-center">
                    <button onClick={loadMore} className="px-8 py-3 gradient-green text-white rounded-xl font-bold shadow-lg">Load More</button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                {products.map((product, index) => (
                  <ProductListItem key={product._id || product.id} product={product} index={index} />
                ))}
                {loading && [1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}
                {hasMore && !loading && (
                  <div className="mt-8 text-center">
                    <button onClick={loadMore} className="px-8 py-3 gradient-green text-white rounded-xl font-bold shadow-lg">Load More</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileOffers;
