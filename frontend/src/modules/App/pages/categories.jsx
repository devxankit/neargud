import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFilter, FiX, FiChevronRight } from "react-icons/fi";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import { categories as fallbackCategories } from "../../../data/categories";
// Mock products removed favor of API
// import { products } from "../../../data/products"; 
import { useCategoryStore } from "../../../store/categoryStore";
import { fetchPublicProducts } from "../../../services/publicApi";
import PageTransition from "../../../components/PageTransition";
import LazyImage from "../../../components/LazyImage";
import ProductCard from "../../../components/ProductCard";
import useMobileHeaderHeight from "../../../hooks/useMobileHeaderHeight";

const MobileCategories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultHeaderHeight = useMobileHeaderHeight();

  // Destructure getCategoryById from store
  const { categories, fetchCategories, getCategoriesByParent, getRootCategories, getCategoryById } = useCategoryStore();

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories().catch(err => {
        console.error('Failed to fetch categories:', err);
      });
    }
  }, []);

  // Get root categories (categories without parent)
  const rootCategories = useMemo(() => {
    const roots = getRootCategories();
    // Use fallback if roots from store are empty (ensures UI isn't empty during load)
    return roots.length > 0 ? roots : fallbackCategories;
  }, [categories, getRootCategories]);

  // State
  // Initialize with first category immediately
  const [selectedRootId, setSelectedRootId] = useState(rootCategories[0]?.id || null);
  const [currentViewId, setCurrentViewId] = useState(rootCategories[0]?.id || null);
  const [history, setHistory] = useState([]);                 // History for Back Navigation

  // Product State (Fetched via API)
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const categoryListRef = useRef(null);
  const activeCategoryRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  // Initialize selection
  useEffect(() => {
    // Only set if not already set (preserve state on updates)
    if (rootCategories.length > 0 && !selectedRootId) {
      const firstId = rootCategories[0].id;
      setSelectedRootId(firstId);
      setCurrentViewId(firstId);
    }
  }, [rootCategories, selectedRootId]);

  // Derived Data
  const currentViewCategory = useMemo(() => {
    // If categories not loaded yet, might look up in fallback
    return getCategoryById(currentViewId) || rootCategories.find(c => c.id === currentViewId) || fallbackCategories.find(c => c.id === currentViewId);
  }, [currentViewId, categories, getCategoryById, rootCategories]);

  const displaySubcategories = useMemo(() => {
    if (!currentViewId) return [];
    const subcats = getCategoriesByParent(currentViewId);
    return subcats.filter(cat => cat.isActive !== false);
  }, [currentViewId, categories, getCategoriesByParent]);


  // FETCH PRODUCTS EFFECT
  useEffect(() => {
    const loadProducts = async () => {
      if (!currentViewId) return;

      // Only fetch products for subcategories (not root categories)
      if (!currentViewCategory?.parentId) {
        setProducts([]);
        return;
      }

      setIsLoadingProducts(true);
      try {
        // Build Query Params including filters
        const params = {
          search: searchQuery || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          minRating: filters.minRating || undefined,
        };

        // Using subcategoryId based on previous fix
        params.subcategoryId = currentViewId;

        const response = await fetchPublicProducts(params);
        // Handle potentially different response structures (unwrapped data or axios response)
        const data = response.data || response;
        const list = Array.isArray(data) ? data : (data.products || []);
        setProducts(list);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [currentViewId, currentViewCategory, searchQuery, filters]);

  // Initial Mount Animation
  useEffect(() => {
    if (isInitialMount) {
      requestAnimationFrame(() => setIsInitialMount(false));
    }
  }, [isInitialMount]);

  // Scroll Sidebar Active Item
  useEffect(() => {
    if (activeCategoryRef.current && categoryListRef.current) {
      const element = activeCategoryRef.current;
      const container = categoryListRef.current;
      const top = element.offsetTop;
      const height = element.offsetHeight;
      const cHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      if (top < scrollTop || top + height > scrollTop + cHeight) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: top - container.offsetTop - 10,
            behavior: "smooth",
          });
        });
      }
    }
  }, [selectedRootId]);

  // Handlers
  const handleRootSelect = (id) => {
    setSelectedRootId(id);
    setCurrentViewId(id);
    setHistory([]); // Reset drill down
  };

  const handleSubcategoryClick = (subId) => {
    // Drill down
    setHistory(prev => [...prev, currentViewId]);
    setCurrentViewId(subId);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevId = newHistory.pop();
    setHistory(newHistory);
    setCurrentViewId(prevId);
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({ minPrice: "", maxPrice: "", minRating: "" });
  };

  // Close filter dropdown
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

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.minRating;
  const contentHeight = `calc(100vh - 80px)`;
  const headerSectionHeight = 80;

  if (rootCategories.length === 0) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true}>
          <div className="w-full flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mx-auto mb-4">📦</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Categories Available</h2>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MobileLayout showBottomNav={true} showCartBar={true}>
        <div className="w-full flex flex-col" style={{ minHeight: contentHeight }}>

          {/* Header */}
          {currentViewCategory && (
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
              <div key={`header-${currentViewId}`} className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <FiArrowLeft className="text-xl text-gray-700" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-800 mb-1 truncate">
                    {currentViewCategory.name}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {isLoadingProducts ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 relative">
                  <div ref={filterButtonRef} className="relative">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${showFilters ? "bg-gray-100" : ""}`}>
                      <FiFilter className={`text-xl transition-colors ${hasActiveFilters ? "text-blue-600" : "text-gray-700"}`} />
                    </button>
                    {/* Filter Dropdown */}
                    <AnimatePresence>
                      {showFilters && (
                        <>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/20 z-40" />
                          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute right-0 top-full w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 mt-[-32px] overflow-hidden">
                            <div className="flex justify-between px-3 py-2 border-b bg-gray-50"><span className="text-sm font-bold">Filters</span><FiX onClick={() => setShowFilters(false)} /></div>
                            <div className="p-3 space-y-3">
                              <div><h4 className="text-xs font-semibold mb-1">Price</h4><div className="flex gap-2"><input type="number" placeholder="Min" value={filters.minPrice} onChange={e => handleFilterChange("minPrice", e.target.value)} className="w-full text-xs border rounded p-1" /><input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => handleFilterChange("maxPrice", e.target.value)} className="w-full text-xs border rounded p-1" /></div></div>
                              <button onClick={clearFilters} className="w-full py-1 text-xs bg-gray-100 rounded">Clear</button>
                              <button
                                onClick={() => setShowFilters(false)}
                                className="w-full py-1 text-xs gradient-green text-white rounded font-semibold mt-1"
                              >
                                Apply
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-1" style={{ minHeight: `calc(${contentHeight} - ${headerSectionHeight}px)` }}>

            {/* Left Panel - Roots */}
            <div ref={categoryListRef} className="w-[25%] bg-gray-50 border-r border-gray-200 overflow-y-auto scrollbar-hide flex-shrink-0" style={{ maxHeight: `calc(${contentHeight} - ${headerSectionHeight}px)` }}>
              <div className="pb-[190px]">
                {rootCategories.map((category) => {
                  const isActive = category.id === selectedRootId;
                  return (
                    <div key={category.id} ref={isActive ? activeCategoryRef : null}>
                      <motion.button
                        onClick={() => handleRootSelect(category.id)}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full px-2 py-3 text-left transition-all relative ${isActive ? "bg-white border-l-4 border-primary-500 shadow-sm" : "hover:bg-gray-100 border-l-4 border-transparent"}`}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ${isActive ? "ring-2 ring-primary-500 scale-105" : ""}`}>
                            <LazyImage src={category.image} alt={category.name} className="w-full h-full object-cover" onError={e => e.target.src = "https://via.placeholder.com/48?text=Cat"} />
                          </div>
                          <span className={`text-[10px] font-semibold text-center leading-tight ${isActive ? "text-primary-600" : "text-gray-700"}`}>
                            {category.name}
                          </span>
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Logic: Show Subcategories Grid. AND Show Products below. */}
            <div className="w-[75%] overflow-y-auto bg-white flex-shrink-0" style={{ maxHeight: `calc(${contentHeight} - ${headerSectionHeight}px)` }}>
              <div className="p-3">

                {/* Navigation Header (Drill Down) */}
                {history.length > 0 && currentViewCategory && (
                  <div className="mb-4 flex items-center gap-2">
                    <button onClick={handleBack} className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
                      <FiArrowLeft className="text-lg" />
                      Back
                    </button>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm font-bold text-primary-700">{currentViewCategory.name}</span>
                  </div>
                )}

                {/* Subcategories Grid */}
                {displaySubcategories.length > 0 && (
                  <div className="mb-6">
                    {!history.length && (
                      <h3 className="text-sm font-bold text-gray-800 mb-3 px-1 flex items-center gap-2">
                        <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                        Shop by {currentViewCategory?.name}
                      </h3>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {displaySubcategories.map((sub) => (
                        <motion.button
                          key={sub.id}
                          onClick={() => handleSubcategoryClick(sub.id)}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all"
                        >
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white mb-2 shadow-sm ring-1 ring-gray-100">
                            <LazyImage src={sub.image} alt={sub.name} className="w-full h-full object-cover" onError={e => e.target.src = "https://via.placeholder.com/64?text=Sub"} />
                          </div>
                          <span className="text-[10px] font-semibold text-center line-clamp-2 leading-tight text-gray-700">
                            {sub.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {currentViewCategory?.parentId && (
                  <>
                    {isLoadingProducts ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl text-gray-300 mx-auto mb-4">📦</div>
                        <h3 className="text-lg font-bold text-gray-800">No products found</h3>
                        <p className="text-sm text-gray-600 mt-1">Try browsing other categories.</p>
                      </div>
                    ) : (
                      <motion.div
                        key={`products-${currentViewId}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-2 gap-2"
                      >
                        {products.map(product => (
                          <div key={product.id}><ProductCard product={product} /></div>
                        ))}
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileCategories;
