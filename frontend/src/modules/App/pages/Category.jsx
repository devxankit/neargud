import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiFilter, FiArrowLeft, FiGrid, FiList, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MobileLayout from "../../../components/Layout/Mobile/MobileLayout";
import ProductCard from "../../../components/ProductCard";
import ProductListItem from "../components/ProductListItem";
import { products } from "../../../data/products";
import { categories as fallbackCategories } from "../../../data/categories";
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
  const categoryId = parseInt(id);
  const { categories, initialize, getCategoryById, getCategoriesByParent } = useCategoryStore();
  
  // Initialize store on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get category from store or fallback
  const category = useMemo(() => {
    const cat = getCategoryById(categoryId);
    return cat || fallbackCategories.find((cat) => cat.id === categoryId);
  }, [categoryId, categories, getCategoryById]);

  // Get subcategories for this category
  const subcategories = useMemo(() => {
    if (!categoryId) return [];
    return getCategoriesByParent(categoryId).filter(cat => cat.isActive !== false);
  }, [categoryId, categories, getCategoriesByParent]);

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

  const slides = [
    { image: "/images/hero/slide1.png" },
    { image: "/images/hero/slide2.png" },
    { image: "/images/hero/slide3.png" },
    { image: "/images/hero/slide4.png" },
  ];

  // Map category ID to theme tab - each category has a unique color theme
  const getThemeTab = (catId) => {
    const themeMap = {
      1: 'fashion', // Clothing - Purple theme
      2: 'footwear', // Footwear - Brown/leather theme
      3: 'leather', // Bags - Leather theme
      4: 'jewelry', // Jewelry - Golden theme
      5: 'winter', // Accessories - Blue theme
      6: 'sports', // Athletic - Blue theme
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

  const categoryProducts = useMemo(() => {
    if (!category) return [];

    const keywords = categoryMap[categoryId] || [];
    let result = products.filter((product) => {
      const productName = product.name.toLowerCase();
      return keywords.some((keyword) => productName.includes(keyword));
    });

    if (filters.minPrice) {
      result = result.filter(
        (product) => product.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      result = result.filter(
        (product) => product.price <= parseFloat(filters.maxPrice)
      );
    }
    if (filters.minRating) {
      result = result.filter(
        (product) => product.rating >= parseFloat(filters.minRating)
      );
    }

    return result;
  }, [categoryId, category, filters]);

  const { displayedItems, hasMore, isLoading, loadMore, loadMoreRef } =
    useInfiniteScroll(categoryProducts, 10, 10);

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

  if (!category) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Category Not Found
              </h2>
              <button
                onClick={() => navigate("/app")}
                className="gradient-green text-white px-6 py-3 rounded-xl font-semibold">
                Go Back Home
              </button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <MobileLayout showBottomNav={true} showCartBar={true}>
        <div className="w-full pb-24 overflow-x-hidden">
          {/* PromoStrip - HOUSEFULL SALE Section with Hero Banner inside */}
          <PromoStrip 
            activeTab={activeTab} 
            categoryName={category?.name}
            categoryId={categoryId}
            heroBanner={
              <div className="py-2">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', paddingLeft: '1.5rem' }}>
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 rounded-2xl overflow-hidden"
                      style={{
                        width: '75%',
                        maxWidth: '280px',
                        height: '320px',
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
          <FeaturedVendorsSection />

          {/* New Arrivals */}
          <NewArrivalsSection />

          {/* Recommended for You */}
          <RecommendedSection />

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
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-600"
                    }`}
                  >
                    <FiList className="text-lg" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === "grid"
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
                  className={`p-2.5 glass-card rounded-xl hover:bg-white/80 transition-colors ${
                    showFilters ? "bg-white/80" : ""
                  }`}>
                  <FiFilter
                    className={`text-lg transition-colors ${
                      hasActiveFilters ? "text-blue-600" : "text-gray-600"
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
                            onClick={clearFilters}
                            className="w-full py-1.5 bg-gray-200 text-gray-700 rounded-md font-semibold text-xs hover:bg-gray-300 transition-colors">
                            Clear All
                          </button>
                          <button
                            onClick={() => setShowFilters(false)}
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
            {categoryProducts.length === 0 ? (
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
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {displayedItems.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="mt-6 flex flex-col items-center gap-4">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">
                          Loading more products...
                        </span>
                      </div>
                    )}
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-6 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3">
                  {displayedItems.map((product, index) => (
                    <ProductListItem
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="mt-6 flex flex-col items-center gap-4">
                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">
                          Loading more products...
                        </span>
                      </div>
                    )}
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-6 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileCategory;
