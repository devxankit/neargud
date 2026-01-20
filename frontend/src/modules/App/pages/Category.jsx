import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiFilter, FiArrowLeft, FiGrid, FiList, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import ProductCard from "../../../components/ProductCard";
import ProductListItem from "../components/ProductListItem";
import { fetchPublicCategories, fetchPublicProducts, fetchActiveBanners, fetchPublicVendors, fetchRecommendedProducts } from "../../../services/publicApi";
import { useCategoryStore } from "../../../store/categoryStore";
import PageTransition from "../../../components/PageTransition";
import useInfiniteScroll from "../../../hooks/useInfiniteScroll";
import LazyImage from "../../../components/LazyImage";
import PromoStrip from "../../../components/PromoStrip";
import LowestPricesEver from "../../../components/LowestPricesEver";
import BrandLogosScroll from "../../../components/Home/BrandLogosScroll";
import FeaturedVendorsSection from "../components/FeaturedVendorsSection";
import NewArrivalsSection from "../components/NewArrivalsSection";
import RecommendedSection from "../components/RecommendedSection";

const MobileCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // We use the string id for API calls, and a normalized version for themes if needed
  const categoryId = id;
  const { categories, getCategoryById, getCategoriesByParent } = useCategoryStore();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  // Hero banner carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [autoSlidePaused, setAutoSlidePaused] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, bannersRes, vendorsRes, arrivalsRes, recommendedRes] = await Promise.all([
        fetchPublicCategories(),
        fetchActiveBanners(), // We could also filter banners by category if backend supports it
        fetchPublicVendors(),
        fetchPublicProducts({ categoryId: id, limit: 6, sort: '-createdAt' }),
        fetchPublicProducts({ categoryId: id, limit: 10, sort: '-popularity' }) // Category specific popular products
      ]);
      if (catsRes) {
        const allCats = catsRes.data.categories || [];
        const currentCat = allCats.find(c => (c._id) === id);
        setCategory(currentCat);
        setSubcategories(allCats.filter(c => c.parentId === id));
      }

      if (bannersRes.success) setBanners(bannersRes.data.banners || []);
      if (vendorsRes.success) setVendors(vendorsRes.data.vendors || []);
      if (arrivalsRes.success) setNewArrivals(arrivalsRes.data.products || []);
      if (recommendedRes.success) setRecommended(recommendedRes.data.products || []);

    } catch (error) {
      console.error("Error fetching category page data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (pageNum = 1, append = false) => {
    try {
      setProductsLoading(true);
      const params = {
        categoryId: id,
        page: pageNum,
        limit: 10,
        ...filters
      };
      const res = await fetchPublicProducts(params);
      if (res.success) {
        const newProducts = res.data.products;
        setCategoryProducts(prev => append ? [...prev, ...newProducts] : newProducts);
        setHasMore(newProducts.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProducts(1, false);
  }, [id]);

  useEffect(() => {
    fetchProducts(1, false);
  }, [filters]);


  const slides = [
    { image: "/images/hero/slide1.png" },
    { image: "/images/hero/slide2.png" },
    { image: "/images/hero/slide3.png" },
    { image: "/images/hero/slide4.png" },
  ];

  // Map category ID to theme tab - each category has a unique color theme
  const getThemeTab = (catId) => {
    // If it's a numeric ID (legacy) or we can map common Mongo IDs
    const themeMap = {
      1: 'fashion',
      2: 'footwear',
      3: 'leather',
      4: 'jewelry',
      5: 'winter',
      6: 'sports',
    };
    return themeMap[catId] || 'all';
  };

  const activeTab = getThemeTab(categoryId);

  // Auto-slide disabled - banners are manually scrollable only

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      setTouchStart(touch.clientX);
      setTouchEnd(null);
      setDragOffset(0);
      setAutoSlidePaused(true);
    }
  };

  const onTouchMove = (e) => {
    if (touchStart === null) return;
    e.stopPropagation();
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const diff = touchStart - currentX;
      const containerWidth = e.currentTarget?.offsetWidth || 400;
      const maxDrag = containerWidth * 0.5;
      setDragOffset(Math.max(-maxDrag, Math.min(maxDrag, diff)));
      setTouchEnd(currentX);
    }
  };

  const onTouchEnd = (e) => {
    if (e) e.stopPropagation();

    if (touchStart === null) {
      setAutoSlidePaused(false);
      return;
    }

    const distance = touchStart - (touchEnd || touchStart);
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }

    setTouchStart(null);
    setTouchEnd(null);
    setDragOffset(0);
    setAutoSlidePaused(false);
  };

  const categoryMap = {
    1: [
      "t-shirt",
      "shirt",
      "jeans",
      "dress",
      "gown",
      "skirt",
      "blazer",
      "jacket",
      "cardigan",
      "sweater",
      "flannel",
      "maxi",
    ],
    2: ["sneakers", "pumps", "boots", "heels", "shoes"],
    3: ["bag", "crossbody", "handbag"],
    4: ["necklace", "watch", "wristwatch"],
    5: ["sunglasses", "belt", "scarf"],
    6: ["athletic", "running", "track", "sporty"],
  };

  const loadMore = () => {
    if (!productsLoading && hasMore) {
      fetchProducts(page + 1, true);
    }
  };

  const filterButtonRef = useRef(null);

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      minRating: "",
    });
  };

  // Check if any filter is active
  const hasActiveFilters =
    filters.minPrice || filters.maxPrice || filters.minRating || filters.category;

  // Close filter dropdown when clicking outside
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

  if (loading) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showHeader={false}>
          <div className="animate-pulse p-4">
            <div className="w-full h-40 bg-gray-200 rounded-2xl mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <MobileLayout showBottomNav={true} showCartBar={true}>
      <div className="w-full overflow-x-hidden">
        {/* PromoStrip - HOUSEFULL SALE Section with Hero Banner inside */}
        <PromoStrip
          activeTab={activeTab}
          categoryName={category?.name}
          categoryId={id}
          heroBanner={
            <div className="py-2">
              <div className="flex gap-4 overflow-x-auto scrollbar-hide" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingLeft: '1.5rem' }}>
                {banners.map((slide, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 rounded-2xl overflow-hidden"
                    style={{
                      width: '75%',
                      maxWidth: '280px',
                      height: '240px',
                      scrollSnapAlign: 'start'
                    }}>
                    <LazyImage
                      src={slide.image}
                      alt={slide.title || `Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x200?text=Banner+${index + 1}`;
                      }}
                    />
                  </div>
                ))}
                {banners.length === 0 && slides.map((slide, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 rounded-2xl overflow-hidden"
                    style={{
                      width: '75%',
                      maxWidth: '280px',
                      height: '240px',
                      scrollSnapAlign: 'start'
                    }}>
                    <LazyImage
                      src={slide.image}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x200?text=Banner+${index + 1}`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          }
        />

        {/* LowestPricesEver Section */}
        <LowestPricesEver activeTab={activeTab} />

        {/* Brand Logos Scroll */}
        <div className="mt-6">
          <BrandLogosScroll />
        </div>

        {/* Featured Vendors Section */}
        <FeaturedVendorsSection vendors={vendors} loading={loading} />

        {/* New Arrivals */}
        <NewArrivalsSection products={newArrivals} loading={loading} />

        {/* Recommended for You */}
        <RecommendedSection products={recommended} loading={loading} />

        {/* Subcategories Grid */}
        {subcategories.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Shop by Subcategory</h2>
            <div className="grid grid-cols-4 gap-3">
              {subcategories.map((sub) => (
                <Link
                  key={sub._id || sub.id}
                  to={`/app/category/${sub._id || sub.id}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                    <LazyImage
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=Cat'}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 text-center uppercase tracking-tighter leading-tight">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <LazyImage
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/48x48?text=Category";
                }}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-800">
                {category.name}
              </h1>
              <p className="text-sm text-gray-600">
                {categoryProducts.length} product
                {categoryProducts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle Buttons */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded transition-colors ${viewMode === "list"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-600"
                    }`}
                >
                  <FiList className="text-lg" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded transition-colors ${viewMode === "grid"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-600"
                    }`}
                >
                  <FiGrid className="text-lg" />
                </button>
              </div>
              <div ref={filterButtonRef} className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2.5 glass-card rounded-xl hover:bg-white/80 transition-colors ${showFilters ? "bg-white/80" : ""
                    }`}>
                  <FiFilter
                    className={`text-lg transition-colors ${hasActiveFilters ? "text-green-600" : "text-gray-600"
                      }`}
                  />
                </button>

                {/* Filter Dropdown */}
                <AnimatePresence>
                  {showFilters && (
                    <>
                      {/* Backdrop */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowFilters(false)}
                        className="fixed inset-0 bg-black/20 z-[10000]"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        className="filter-dropdown absolute right-0 top-full w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-[10001] overflow-hidden"
                        style={{ marginTop: "-50px" }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-1.5">
                            <FiFilter className="text-sm text-gray-700" />
                            <h3 className="text-sm font-bold text-gray-800">
                              Filters
                            </h3>
                          </div>
                          <button
                            onClick={() => setShowFilters(false)}
                            className="p-0.5 hover:bg-gray-200 rounded-full transition-colors">
                            <FiX className="text-sm text-gray-600" />
                          </button>
                        </div>

                        {/* Filter Content */}
                        <div className="max-h-[50vh] overflow-y-auto scrollbar-hide">
                          <div className="p-2 space-y-2">
                            {/* Price Range */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1 text-xs">
                                Price Range
                              </h4>
                              <div className="space-y-1.5">
                                <input
                                  type="number"
                                  placeholder="Min Price"
                                  value={filters.minPrice}
                                  onChange={(e) =>
                                    handleFilterChange("minPrice", e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                                />
                                <input
                                  type="number"
                                  placeholder="Max Price"
                                  value={filters.maxPrice}
                                  onChange={(e) =>
                                    handleFilterChange("maxPrice", e.target.value)
                                  }
                                  className="w-full px-2 py-1.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                                />
                              </div>
                            </div>

                            {/* Rating Filter */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1 text-xs">
                                Minimum Rating
                              </h4>
                              <div className="space-y-0.5">
                                {[4, 3, 2, 1].map((rating) => (
                                  <label
                                    key={rating}
                                    className="flex items-center gap-1.5 cursor-pointer p-1 rounded-md hover:bg-gray-50 transition-colors">
                                    <input
                                      type="radio"
                                      name="minRating"
                                      value={rating}
                                      checked={
                                        filters.minRating === rating.toString()
                                      }
                                      onChange={(e) =>
                                        handleFilterChange(
                                          "minRating",
                                          e.target.value
                                        )
                                      }
                                      className="w-3 h-3 appearance-none rounded-full border-2 border-gray-300 bg-white checked:bg-white checked:border-primary-500 relative cursor-pointer"
                                      style={{
                                        backgroundImage:
                                          filters.minRating === rating.toString()
                                            ? "radial-gradient(circle, #10b981 40%, transparent 40%)"
                                            : "none",
                                      }}
                                    />
                                    <span className="text-xs text-gray-700">
                                      {rating}+ Stars
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-2 bg-gray-50 space-y-1.5">
                          <button
                            onClick={() => {
                              clearFilters();
                              // We might want to auto-apply on clear, or wait for user to click Apply
                              // Let's auto-apply for better UX
                              setFilters({
                                category: "",
                                minPrice: "",
                                maxPrice: "",
                                minRating: "",
                              });
                              // Since state update is async, we can either use a separate effect or just close for now
                              // But better to let user verify.
                            }}
                            className="w-full py-1.5 bg-gray-200 text-gray-700 rounded-md font-semibold text-xs hover:bg-gray-300 transition-colors">
                            Clear All
                          </button>
                          <button
                            onClick={() => {
                              setShowFilters(false);
                              // The useEffect listening to [filters] will trigger the fetch
                              // But if filters state hasn't changed (e.g. valid input same value), it won't trigger
                              // So we can force fetch if needed, but dependency array handles it if state changed.
                              // If they just opened and closed without changing, no fetch needed.
                            }}
                            className="w-full py-1.5 gradient-green text-white rounded-md font-semibold text-xs hover:shadow-glow-green transition-all">
                            Apply Filters
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

        {/* Products List */}
        <div className="px-4 py-4">
          {productsLoading && categoryProducts.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-2 space-y-3 shadow-sm animate-pulse">
                  <div className="w-full aspect-square bg-slate-50 rounded-xl" />
                  <div className="px-1 space-y-2">
                    <div className="h-3 bg-slate-50 rounded w-5/6" />
                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : categoryProducts.length === 0 && !productsLoading && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mx-auto mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                There are no products available in this category at the
                moment.
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryProducts.map((product, index) => (
                      <motion.div
                        key={product._id || product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}>
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                      {productsLoading && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiLoader className="animate-spin text-xl" />
                          <span>Loading more...</span>
                        </div>
                      )}
                      <button
                        onClick={loadMore}
                        disabled={productsLoading}
                        className="px-6 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {productsLoading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    {categoryProducts.map((product, index) => (
                      <ProductListItem
                        key={product._id || product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-6 flex flex-col items-center gap-4">
                      {productsLoading && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FiLoader className="animate-spin text-xl" />
                          <span>Loading more...</span>
                        </div>
                      )}
                      <button
                        onClick={loadMore}
                        disabled={productsLoading}
                        className="px-6 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {productsLoading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileCategory;
